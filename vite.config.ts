import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const LOCAL_API_ORIGIN = 'http://localhost:8788';
// Cloudflare Pages sets the commit; local builds get a timestamp so every build is distinct.
const BUILD_ID = process.env.CF_PAGES_COMMIT_SHA ?? `local-${Date.now()}`;
const API_OFFLINE_BODY = JSON.stringify({
  error: { code: 'api-offline', message: 'A API local não está rodando. Use "pnpm dev", que sobe o site e a API juntos.' },
});

// Open tabs compare their own build id with this file to offer a reload after a deploy.
function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ buildId: BUILD_ID }) });
    },
  };
}

export default defineConfig({
  plugins: [react(), versionFile()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@contracts': fileURLToPath(new URL('./contracts', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: LOCAL_API_ORIGIN,
        changeOrigin: false,
        configure(proxy) {
          let warned = false;
          proxy.on('error', (_error, _request, response) => {
            if (!warned) {
              warned = true;
              console.warn(`\n[api] Nada respondendo em ${LOCAL_API_ORIGIN}. Rode "pnpm dev" (site e API juntos) ou "pnpm dev:api" em outro terminal.\n`);
            }
            if ('writeHead' in response && !response.headersSent) {
              response.writeHead(503, { 'Content-Type': 'application/json' });
              response.end(API_OFFLINE_BODY);
            }
          });
          proxy.on('proxyRes', () => {
            warned = false;
          });
        },
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts', 'contracts/**/*.test.ts'],
  },
});

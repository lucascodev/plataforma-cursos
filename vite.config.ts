import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const LOCAL_API_ORIGIN = 'http://localhost:8788';
const API_OFFLINE_BODY = JSON.stringify({
  error: { code: 'api-offline', message: 'A API local não está rodando. Use "npm run dev", que sobe o site e a API juntos.' },
});

export default defineConfig({
  plugins: [react()],
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
              console.warn(`\n[api] Nada respondendo em ${LOCAL_API_ORIGIN}. Rode "npm run dev" (site e API juntos) ou "npm run dev:api" em outro terminal.\n`);
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

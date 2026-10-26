import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Runs the Cloudflare functions and the Vite dev server together and stops both when either one exits.
const isWindows = process.platform === 'win32';
const API_COMMAND = ['wrangler', 'pages', 'dev', 'public', '--port', '8788', '--compatibility-date', '2026-10-01'];
const SITE_COMMAND = ['vite'];

if (!existsSync('.dev.vars')) {
  console.warn(
    '\n[dev] Arquivo .dev.vars não encontrado. Copie .dev.vars.example para .dev.vars e preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.' +
      '\n[dev] Sem ele, o site abre, mas a /api responde 503.\n',
  );
}

const children = [API_COMMAND, SITE_COMMAND].map(([command, ...args]) => spawn(command, args, { stdio: 'inherit', shell: isWindows }));

let stopping = false;
function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || child.pid === undefined) continue;
    // With shell: true on Windows, kill() only reaches cmd.exe; taskkill /T takes the whole process tree.
    if (isWindows) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
  process.exit(exitCode);
}

for (const child of children) child.on('exit', (code) => stopAll(code ?? 0));
process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

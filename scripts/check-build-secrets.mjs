import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BUILD_DIR = process.argv[2] ?? 'dist';
const TEXT_EXTENSIONS = /\.(html|js|mjs|css|json|map|txt|svg|webmanifest)$/i;
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;
const FORBIDDEN = [
  { name: 'Supabase secret key', pattern: /sb_secret_[A-Za-z0-9_-]{8,}/ },
  { name: 'Supabase publishable key (the browser talks only to /api now)', pattern: /sb_publishable_[A-Za-z0-9_-]{8,}/ },
  { name: 'Supabase project URL (the browser talks only to /api now)', pattern: /https:\/\/[a-z0-9]{20}\.supabase\.co/ },
  { name: 'GitHub token', pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b/ },
  { name: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'DeepSeek or OpenAI style key', pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
];

function listFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function jwtRole(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')).role ?? null;
  } catch {
    return null;
  }
}

const findings = [];
for (const file of listFiles(BUILD_DIR).filter((path) => TEXT_EXTENSIONS.test(path))) {
  const content = readFileSync(file, 'utf8');
  for (const { name, pattern } of FORBIDDEN) {
    if (pattern.test(content)) findings.push(`${file}: ${name}`);
  }
  for (const token of content.match(JWT) ?? []) {
    const role = jwtRole(token);
    if (role === 'service_role') findings.push(`${file}: Supabase service_role JWT`);
    if (role === 'anon') findings.push(`${file}: Supabase anon JWT (the browser talks only to /api now)`);
  }
}

if (findings.length > 0) {
  console.error('Secrets found in the build output. Do not publish this build:');
  for (const finding of findings) console.error(`  - ${finding}`);
  console.error('Rotate the exposed key in the provider dashboard right away.');
  process.exit(1);
}

console.log(`No secrets found in ${BUILD_DIR}.`);

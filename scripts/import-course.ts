import { readFileSync } from 'node:fs';
import { courseContentSchema } from '../contracts/course-content.schema.ts';

// Runs only on a maintainer's machine. The secret key comes from .env.local (git-ignored) and never reaches the site.
const USAGE = 'Uso: npm run content:import -- supabase/seed/courses/<slug>.json [--publish]';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const [file, ...flags] = process.argv.slice(2);
if (!file) fail(USAGE);

const url = process.env.SUPABASE_URL ?? '';
const secretKey = process.env.SUPABASE_SECRET_KEY ?? '';
if (!url || !secretKey) fail('Defina SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env.local.');

const origin = new URL(url);
const isLocal = origin.hostname === 'localhost' || origin.hostname === '127.0.0.1';
if (origin.protocol !== 'https:' && !isLocal) fail('SUPABASE_URL precisa usar https.');
if (!secretKey.startsWith('sb_secret_') && !secretKey.startsWith('eyJ')) fail('SUPABASE_SECRET_KEY não parece uma chave secreta do Supabase.');

const parsed = courseContentSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
  fail(`Curso inválido em ${file}:\n${problems.join('\n')}`);
}

const { $schema: _schema, ...content } = parsed.data;
const publish = flags.includes('--publish');
const headers: Record<string, string> = {
  apikey: secretKey,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};
if (secretKey.startsWith('eyJ')) headers.Authorization = `Bearer ${secretKey}`;

const response = await fetch(`${origin.origin}/rest/v1/courses?on_conflict=slug`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ slug: content.slug, content, ...(publish ? { published: true } : {}) }),
}).catch((error: unknown) => fail(`Não foi possível falar com o Supabase em ${origin.origin}: ${String(error)}`));

if (!response.ok) fail(`O Supabase recusou a importação (${response.status}): ${await response.text()}`);
console.log(
  publish
    ? `Curso "${content.slug}" importado e publicado.`
    : `Curso "${content.slug}" importado. Se ele for novo, fica como rascunho até você rodar de novo com --publish.`,
);

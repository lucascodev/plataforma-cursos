# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## Não lançado

### Adicionado

- Rotas `/api` no Cloudflare Pages Functions: login com GitHub por PKCE no servidor, sessão em cookies `__Host-` HttpOnly, renovação automática do token e logout.
- Tabela `courses` no Supabase, com leitura pública dos cursos publicados e escrita só por admin.
- Script `npm run content:import` para validar e importar cursos.
- Página **Entrar** e prévia pública de cada curso para quem ainda não entrou.
- Cabeçalhos de segurança em `public/_headers` (CSP com `connect-src 'self'`, HSTS, `frame-ancestors 'none'`).
- Testes das functions e do cliente HTTP.

### Alterado

- O navegador não fala mais com o Supabase: progresso, cursos e sessão passam por `/api`.
- Hospedagem passa do GitHub Pages para o Cloudflare Pages.
- Rotas sem `#` (`/cursos/<slug>` em vez de `#/cursos/<slug>`).
- Cursos saem de `content/courses/` e passam a ficar em `supabase/seed/courses/`; schemas compartilhados vão para `contracts/`.
- A varredura do build falha também com chave publicável ou URL do Supabase no `dist/`.

### Removido

- Modo visitante, progresso no `localStorage` e migração do progresso do navegador para a conta.
- Dependência `@supabase/supabase-js` e variáveis `VITE_SUPABASE_*`.
- Workflow de deploy no GitHub Pages e CSP por meta tag.

## 1.0.0 - 2026-10-26

### Adicionado

- Plataforma em React, Vite e TypeScript com Clean Architecture por módulo.
- Catálogo de cursos a partir de arquivos JSON validados por schema.
- Curso Engenharia de IA (9 módulos, 75 aulas, 38 exercícios de fixação, 7 projetos e projeto de conclusão).
- Plano de estudo diário, calendário semanal, diário e anotações por módulo.
- Modo visitante com progresso no navegador.
- Contas com login do GitHub via Supabase, com RLS e migração do progresso do navegador para a conta.
- Backup em JSON, exportação do diário em Markdown e opção de apagar o progresso.
- Página de privacidade.
- CI com tipos, lint, testes, build, varredura de chaves no build, auditoria de dependências, CodeQL e Dependabot.
- Deploy automático no GitHub Pages.

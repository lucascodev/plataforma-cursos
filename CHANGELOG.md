# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## Não lançado

### Adicionado

- Migrations aplicadas pelo CI: a cada push na `main`, o job `release` roda `supabase db push` e só depois pede o deploy ao Cloudflare por Deploy Hook. Guia em `docs/migracoes.md`.
- Comandos `pnpm db:*` (Supabase CLI no projeto) e `supabase/config.toml` para subir o banco local.
- CI aplica todas as migrations do zero, carrega o seed e roda os testes pgTAP e o lint do banco a cada push.
- `supabase/seed.sql`, gerado de `supabase/seed/courses/` por `pnpm db:seed`.
- Limite de escrita por pessoa no banco para progresso, propostas, perfil e preferências (resposta 429).
- `docs/seguranca.md` com o que o código garante e o checklist dos painéis.

- Papéis estudante, professor e admin na tabela `profiles`, com perfil criado no cadastro.
- Propostas de curso pela plataforma (`/propor-curso`, `/minhas-propostas`): enviar, editar enquanto está aberta, retirar e acompanhar a resposta.
- Área de admin (`/admin`): visão geral, fila de propostas com aprovar, pedir ajustes e recusar, cursos (dono, tirar do catálogo, apagar sem estudantes), pessoas e papéis, e histórico.
- Aprovar uma proposta torna a pessoa professora e cria o curso rascunho na mesma transação.
- Histórico de ações em `audit_log`, escrito só por funções do banco.
- Meu perfil com as abas Perfil, Estudos e Conta (tema, fuso e avisos); página pública de professor em `/professores/<endereco>`.
- O curso mostra quem o publicou, com link para a página do professor.
- Mensagens de erro da API em português chegam até a tela.
- Testes de banco para perfis, preferências, propostas e funções de admin.

- Rotas `/api` no Cloudflare Pages Functions: login com GitHub por PKCE no servidor, sessão em cookies `__Host-` HttpOnly, renovação automática do token e logout.
- Tabela `courses` no Supabase, com leitura pública dos cursos publicados e escrita só por admin.
- Script `pnpm content:import` para validar e importar cursos.
- Página **Entrar** e prévia pública de cada curso para quem ainda não entrou.
- Cabeçalhos de segurança em `public/_headers` (CSP com `connect-src 'self'`, HSTS, `frame-ancestors 'none'`).
- Testes das functions e do cliente HTTP.

### Alterado

- O projeto usa pnpm. O CI usava `npm ci` sem `package-lock.json` e falhava em todo push.
- A validação da ligação entre progresso e cursos virou migration; não há mais SQL manual depois de importar os cursos.

- Permissão de admin passa a vir de `profiles.role`; `app_metadata.role` deixa de ser usado nas políticas (quem já era admin é migrado).
- A tabela `courses` não aceita mais escrita direta pela API, nem de admin; mudanças passam por funções com histórico.
- `/api/me` devolve também `handle` e `role`.
- O catálogo lista só cursos publicados e no catálogo; cursos fora do catálogo continuam abrindo pelo link.
- Menu da conta vira um menu do avatar; Privacidade sai do menu principal e fica no rodapé.
- O tema pode ser escolhido na conta (claro, escuro ou igual ao aparelho).

- O navegador não fala mais com o Supabase: progresso, cursos e sessão passam por `/api`.
- Hospedagem passa do GitHub Pages para o Cloudflare Pages.
- Rotas sem `#` (`/cursos/<slug>` em vez de `#/cursos/<slug>`).
- Cursos saem de `content/courses/` e passam a ficar em `supabase/seed/courses/`; schemas compartilhados vão para `contracts/`.
- A varredura do build falha também com chave publicável ou URL do Supabase no `dist/`.

### Removido

- Modo visitante, progresso no `localStorage` e migração do progresso do navegador para a conta.
- Dependência `@supabase/supabase-js` e variáveis `VITE_SUPABASE_*`.
- Workflow de deploy no GitHub Pages e CSP por meta tag.

### Segurança

- Trusted Types obrigatório na CSP. `Access-Control-Allow-Origin: *` removido dos arquivos estáticos. CORP, `X-Permitted-Cross-Domain-Policies` e `Permissions-Policy` mais fechada.
- Respostas da API com `default-src 'none'`. Rota ou método inexistente em `/api` responde 404 em JSON em vez do `index.html`.
- Cookies renovados voltam também nas respostas de erro, e um 429 do Supabase não encerra mais a sessão.
- Logout revoga a sessão no Supabase mesmo depois de uma hora sem uso.
- Refresh token sem o formato do Supabase é recusado sem chamar o Auth.
- Corpo das requisições lido com limite de bytes, mesmo sem `Content-Length`.
- Checks do banco iguais aos schemas da API (títulos com espaços, módulos do esboço, links do perfil só https).
- Limites de propostas e de cursos por conta não podem mais ser furados com pedidos em paralelo.
- Progresso só pode ser salvo em curso publicado.
- Link do código-fonte apontava para `github.com/SEU-USUARIO`; o build agora falha com esse placeholder.
- Actions fixadas por commit, CodeQL também nos workflows e o dependency review sem permissão de escrita.

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

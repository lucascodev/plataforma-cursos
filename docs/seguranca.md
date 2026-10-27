# Segurança: o que o código garante e o que precisa ser configurado

Para relatar uma vulnerabilidade, veja o [SECURITY.md](../SECURITY.md). Este documento é para quem mantém o projeto: o que já está protegido no código e o que precisa ser conferido nos painéis.

## O que o código garante

| Camada | Proteção | Onde |
|---|---|---|
| Navegador | CSP só com `'self'` (mais os avatares do GitHub), Trusted Types obrigatório, `frame-ancestors 'none'`, HSTS, COOP e CORP `same-origin`, `Permissions-Policy` fechada, sem `Access-Control-Allow-Origin` | `public/_headers` |
| API | Respostas JSON com `default-src 'none'`, `nosniff`, `no-referrer` e `no-store` por padrão. Rota ou método inexistente responde 404 em JSON | `server/main/` |
| Escrita | Toda rota que muda dados exige pedido do próprio site (`Sec-Fetch-Site` ou `Origin`), corpo `application/json` lido com limite de bytes e validado por um schema de `contracts/` | `server/main/middleware/handle-api-middleware.ts`, `server/shared/http/` |
| Sessão | Tokens só em cookies `__Host-` HttpOnly. Login por PKCE no servidor. Cookies renovados voltam em toda resposta, inclusive de erro. Logout revoga a sessão no Supabase mesmo depois de uma hora parada | `server/modules/auth/` |
| Chaves | As functions usam só a chave publicável e recusam a secreta. O build falha se achar chave, URL do projeto ou `SEU-USUARIO` no `dist/` | `server/shared/env/`, `scripts/check-build-secrets.mjs` |
| Banco | RLS forçado em todas as tabelas, column grants, funções `security definer` com `search_path` vazio. Checks iguais aos schemas da API, limites de linhas com trava por pessoa e limite de escrita por pessoa (`rate_limits`) | `supabase/migrations/`, testado em `supabase/tests/` |
| Código dos cursos | Exercícios rodam num iframe `sandbox="allow-scripts"` sem `allow-same-origin` (origem opaca: sem cookies, sem acesso à API nem à página), dentro de um Worker, com tempo limite. Só esse iframe tem `'unsafe-eval'` e `'wasm-unsafe-eval'`, numa CSP própria com `connect-src 'self'`. Mensagens do iframe são aceitas só da própria janela dele e validadas por schema | `public/runner/`, `src/shared/infra/code-runner/`, `public/_headers` |
| Laboratórios | O código de conclusão esperado fica em `course_lab_codes`, sem grant para ninguém: só a função `verify_lab_code` lê, e ela responde apenas sim ou não | `supabase/migrations/20261030090000_exercises_labs.sql` |
| CI | Actions fixadas por commit, permissões mínimas, CodeQL também nos workflows, testes de RLS a cada push, auditoria das dependências | `.github/workflows/` |

### Limites de escrita

Contados por pessoa, em janelas fixas. Quem passa recebe `429 rate-limited` até a janela virar.

| Ação | Limite |
|---|---|
| Salvar progresso | 300 a cada 10 minutos |
| Enviar ou editar proposta | 30 por hora |
| Editar perfil | 60 por hora |
| Editar preferências da conta | 60 por hora |
| Salvar rascunho de curso | 600 a cada 10 minutos |
| Enviar versão para revisão | 20 por hora |
| Avisar sobre um perfil | 10 por hora |
| Conferir código de laboratório | 30 a cada 10 minutos |

### Contas bloqueadas

O bloqueio bane o login no Supabase (`banned_until`) e apaga as sessões, então nenhum refresh token volta a funcionar. O token de acesso que já está num navegador vale até uma hora; nesse tempo, políticas restritivas (`private.is_blocked()`) e as funções do banco recusam qualquer gravação, com a mensagem "Sua conta está bloqueada".

### Riscos conhecidos

- **Sem limite por IP na borda.** As regras de rate limit do WAF do Cloudflare exigem um domínio próprio e não funcionam em `*.pages.dev`. Os limites acima são por conta, no banco. Um pedido sem conta que force o servidor a chamar o Auth do Supabase (por exemplo, com um cookie de refresh inventado) é barrado se o token não tiver o formato de um token do Supabase, mas um token com formato válido ainda gasta o limite do Auth. Quando houver domínio próprio, crie regras de rate limit para `/api/auth/*` e `/api/*`.
- **Exercícios e laboratórios são conferência de boa-fé.** Os testes dos exercícios de código vão junto com o curso e rodam no navegador de quem estuda, então dá para marcar como passou sem resolver. O código de conclusão de laboratório é um resumo da saída certa: quem tiver a saída certa (ou o código de outra pessoa) consegue concluir. Isso não vale como prova nem como certificado.
- **`unsafe-eval` no runner.** Python (Pyodide) e o JavaScript dos exercícios precisam de `eval` e WebAssembly. A permissão vale só para `/runner/*`, que roda isolado em origem opaca; o resto do site continua sem `unsafe-eval`.
- **Cache público de 5 minutos.** A lista de cursos e as páginas públicas ficam em cache por até 5 minutos. Um curso tirado do ar pode aparecer por esse tempo.

## Checklist dos painéis

Confira depois de criar o projeto e de tempos em tempos.

### Supabase

- [ ] **Authentication > URL Configuration**: **Site URL** de produção e **Redirect URLs** só com endereços exatos (`https://<site>/api/auth/callback` e, se houver, um alias fixo de staging). Nunca `*.pages.dev` nem `**`: com curinga, alguém pode receber o código de login de outra pessoa num site que ele controla.
- [ ] **Authentication > Providers**: só GitHub ligado. Email e login anônimo desligados. **Allow manual linking** desligado.
- [ ] **Authentication > Sessions**: rotação de refresh token ligada, com detecção de reuso (intervalo padrão de 10 segundos).
- [ ] **JWT**: validade de até 3600 segundos. Prefira as chaves de assinatura assimétricas. Se o segredo JWT legado já foi compartilhado, gire.
- [ ] **API Keys**: use as chaves novas (`sb_publishable_`, `sb_secret_`) e desligue as legadas (`anon`, `service_role`) quando nada mais usar.
- [ ] **Authentication > Rate Limits**: revise os limites de renovação de token e de login. Todas as chamadas saem dos IPs do Cloudflare.
- [ ] **Advisors**: Security Advisor e Performance Advisor sem avisos.
- [ ] **Project Settings > Data API**: só o schema `public` exposto. Se não usa GraphQL, desligue o `pg_graphql`.
- [ ] **Database > Settings**: SSL obrigatório.
- [ ] Previews e testes num projeto separado, nunca no de produção.

### GitHub

- [ ] OAuth App sem escopos além do perfil, com o callback `https://<ref>.supabase.co/auth/v1/callback`.
- [ ] **Code security**: Dependabot, Secret scanning com Push protection e Private vulnerability reporting ligados.
- [ ] Proteção da `main`: PR obrigatório, checks **CI / checks**, **CI / db** e **CodeQL** obrigatórios, sem force push.
- [ ] Environment `production` com os secrets da pipeline (veja [migracoes.md](migracoes.md)). Ninguém além de quem mantém o projeto com acesso de escrita ao repositório.

### Cloudflare

- [ ] Verificação em duas etapas e poucas pessoas com acesso à conta.
- [ ] Variáveis do projeto: só `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `PNPM_VERSION`.
- [ ] Deploy automático de produção desligado e Deploy Hook guardado só no GitHub (veja [deploy.md](deploy.md#deploy-pela-pipeline)).

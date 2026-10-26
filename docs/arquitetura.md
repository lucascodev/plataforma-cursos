# Arquitetura

Este documento descreve o desenho da plataforma: requisitos, componentes, fluxo de dados, camadas e os pontos que devem ser revistos quando o projeto crescer.

## 1. Requisitos

### Funcionais

- Listar cursos e mostrar a página de cada um, mesmo para quem não entrou.
- Exigir login com GitHub para estudar.
- Gerar o plano diário a partir da data de início e do ritmo do curso.
- Marcar aulas, exercícios, projetos e dias como feitos; escrever anotações por módulo e diário por dia.
- Mostrar progresso, ritmo em relação ao plano e o que fazer hoje.
- Exportar e importar backup, exportar o diário e apagar o progresso.
- Publicar cursos novos sem mudar código.
- Receber propostas de curso pela plataforma e analisá-las numa área de admin.
- Ter perfil de estudante (privado), perfil público de professor e preferências de conta.
- Mudar papéis e tirar cursos do catálogo com histórico de cada ação.

### Não funcionais

| Requisito | Meta |
|---|---|
| Custo | Zero: plano gratuito do Cloudflare Pages e do Supabase |
| Segurança | Nenhuma chave nem token no navegador; sessão em cookies HttpOnly; dados de cada pessoa isolados por RLS |
| Privacidade | Mínimo de dados pessoais; nada no armazenamento do navegador; tudo exportável e apagável (LGPD) |
| Desempenho | Primeira tela útil rápida em celular; rotas carregadas sob demanda; catálogo em cache na borda |
| Manutenção | Uma pessoa mantém; código previsível, testado e documentado |

### Premissas

- Até alguns milhares de pessoas ativas: cabe com folga no plano gratuito do Supabase e no limite diário de invocações do Cloudflare.
- Cada pessoa estuda de um aparelho por vez na maior parte do tempo.
- Cursos mudam pouco. Cursos novos chegam por proposta e passam pela análise de um admin.

## 2. Visão geral

```mermaid
flowchart LR
  subgraph Navegador
    SPA[SPA React]
    CK[(cookies HttpOnly<br/>__Host-ca-*)]
  end
  subgraph Cloudflare Pages
    STATIC[Arquivos estáticos<br/>+ _headers]
    API[Functions /api/*]
  end
  GH[GitHub OAuth]
  subgraph Supabase
    AUTH[Auth]
    REST[Data API<br/>PostgREST]
    DB[(Postgres com RLS<br/>courses, course_progress,<br/>profiles, propostas, histórico)]
  end
  SPA --> STATIC
  SPA -- fetch same-origin --> API
  CK -. enviados só para o próprio site .-> API
  API -- PKCE, troca e renovação de token --> AUTH
  AUTH <--> GH
  API -- chave publicável + token da pessoa --> REST
  REST --> DB
```

- **O navegador fala só com o próprio site.** A CSP tem `connect-src 'self'`; não existe cliente Supabase no bundle, nem URL do projeto, nem chave.
- **As functions são um BFF** (backend for frontend): fazem o login, guardam a sessão em cookies e repassam as chamadas ao Supabase.
- **O RLS continua sendo a proteção dos dados.** As functions usam a chave publicável e o token da pessoa, nunca a chave secreta. Mesmo um bug nas functions não dá acesso ao progresso de outra pessoa.
- **O conteúdo dos cursos** fica na tabela `courses`, como um documento JSON por curso, e é validado pelo mesmo schema Zod no script de importação e no site.
- **Papéis e mudanças de estado ficam no banco.** O papel de cada pessoa está em `profiles.role`. Toda ação que mexe em mais de uma tabela ou nos dados de outra pessoa (aprovar proposta, mudar papel, tirar curso do catálogo) é uma função `security definer` que confere o papel e grava o histórico na mesma transação. Detalhes em [papeis-e-propostas.md](papeis-e-propostas.md).

## 3. Sessão e login

### Cookies

| Cookie | Conteúdo | Duração |
|---|---|---|
| `__Host-ca-access` | Token de acesso do Supabase (JWT) | Igual à validade do token, cerca de 1 hora |
| `__Host-ca-refresh` | Token de renovação | 30 dias |
| `__Host-ca-verifier` | Verificador PKCE do login em andamento | 10 minutos |
| `__Host-ca-return` | Caminho interno para voltar depois do login | 10 minutos |

Todos são `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`, sem `Domain`. O prefixo `__Host-` faz o navegador recusar o cookie se alguma dessas condições faltar, e impede que um subdomínio defina cookies com esse nome.

### Fluxo de login

```mermaid
sequenceDiagram
  participant B as Navegador
  participant F as /api (Cloudflare)
  participant S as Supabase Auth
  participant G as GitHub
  B->>F: GET /api/auth/login?returnTo=/cursos/x
  F->>F: gera verificador PKCE e desafio S256
  F-->>B: 302 para S /authorize + cookies verifier e return
  B->>S: authorize (provider=github, redirect_to=/api/auth/callback)
  S->>G: OAuth
  G-->>S: código
  S-->>B: 302 para /api/auth/callback?code=...
  B->>F: GET /api/auth/callback (com cookie verifier)
  F->>S: POST /token?grant_type=pkce (código + verificador)
  S-->>F: access_token + refresh_token
  F-->>B: 302 para /cursos/x + cookies de sessão; apaga verifier e return
```

- O caminho de volta passa por `sanitize-return-path`: só caminhos internos simples são aceitos, o que impede redirecionamento aberto.
- Qualquer falha no callback leva a `/entrar?erro=login`, sem detalhes técnicos na URL.
- A cada requisição, `resolve-session` usa o token de acesso se ele ainda vale por mais de 60 segundos; senão, renova com o token de renovação e devolve cookies novos. Sem sessão válida, a resposta é 401 e os cookies são apagados.
- `POST /api/auth/logout` encerra a sessão no Supabase e apaga os cookies.

### Proteção contra CSRF

- `SameSite=Lax` impede que outro site envie os cookies em `POST`, `PUT` e `DELETE`.
- O middleware de `/api` recusa com 403 qualquer método que altera dados quando `Sec-Fetch-Site` não é `same-origin` ou, na falta dele, quando `Origin` não é o próprio site.
- Corpos de requisição só são aceitos como `application/json` e com tamanho limitado.

## 4. API

| Rota | Método | Sessão | O que faz |
|---|---|---|---|
| `/api/auth/login` | GET | não | Começa o login com GitHub |
| `/api/auth/callback` | GET | não | Termina o login e grava os cookies |
| `/api/auth/logout` | POST | opcional | Encerra a sessão |
| `/api/me` | GET | sim | Devolve `{ user: { id, handle, role, displayName, avatarUrl } }` e cria o perfil se faltar |
| `/api/me/profile` | GET, PUT | sim | Perfil da pessoa (nome, texto, links, opção de mostrar a contagem de estudantes) |
| `/api/me/settings` | GET, PUT | sim | Preferências da conta (tema, fuso, avisos) |
| `/api/courses` | GET | não | Cursos publicados e no catálogo, com cache público curto |
| `/api/courses/:slug` | GET | não | Um curso publicado e quem é o dono |
| `/api/progress` | GET | sim | Resumo do progresso em todos os cursos (só itens concluídos e dias de estudo) |
| `/api/progress/:slug` | GET, PUT, DELETE | sim | Progresso da pessoa no curso |
| `/api/teachers/:handle` | GET | não | Página pública de um professor, com cache público curto |
| `/api/proposals` | GET, POST | sim | Propostas da pessoa; envia uma nova |
| `/api/proposals/:id` | GET, PUT | sim | Uma proposta da pessoa; edita enquanto está aberta |
| `/api/proposals/:id/withdraw` | POST | sim | Retira a proposta |
| `/api/admin/overview` | GET | admin | Números da visão geral |
| `/api/admin/proposals` | GET | admin | Fila de propostas, filtrável por situação |
| `/api/admin/proposals/:id` | GET | admin | Uma proposta com o autor |
| `/api/admin/proposals/:id/approve` | POST | admin | Aprova e cria o curso rascunho |
| `/api/admin/proposals/:id/request-changes` | POST | admin | Pede ajustes |
| `/api/admin/proposals/:id/refuse` | POST | admin | Recusa |
| `/api/admin/courses` | GET | admin | Cursos com dono e contagem de estudantes |
| `/api/admin/courses/:slug` | DELETE | admin | Apaga um curso sem estudantes |
| `/api/admin/courses/:slug/listing` | PUT | admin | Tira do catálogo ou devolve |
| `/api/admin/courses/:slug/owner` | PUT | admin | Troca o dono |
| `/api/admin/people` | GET | admin | Pessoas e papéis, com busca |
| `/api/admin/people/:id/role` | PUT | admin | Muda o papel |
| `/api/admin/audit` | GET | admin | Histórico, do mais novo para o mais antigo |

Erros seguem o formato `{ "error": { "code": "...", "message": "..." } }`, sem stack trace nem mensagem do Supabase. A mensagem já vem escrita para a pessoa e o site a mostra como está. Toda resposta da API tem `Cache-Control: no-store`, exceto as de cursos e de perfis públicos.

As funções do banco sinalizam erros de regra com códigos próprios, que o PostgREST transforma em status HTTP: `42501` vira 403, `PT404` vira 404, `PT409` vira 409 e `PT422` vira 422. O campo `hint` traz um código estável (por exemplo, `slug-taken` ou `last-admin`) que o servidor traduz para a mensagem em português; o texto original do banco nunca chega ao navegador.

## 5. Camadas e módulos

### Site (`src/`)

Cada módulo segue Clean Architecture. As dependências apontam para dentro:

```
presentation  ->  application  ->  domain
infra         ->  application  ->  domain
main/factories monta tudo e é a única ponte entre presentation e infra
```

| Módulo | Responsabilidade | Exporta pelo `index.ts` |
|---|---|---|
| `courses` | Catálogo, prévia pública, plano de estudo, painel do curso | rotas, query do catálogo |
| `progress` | Estado do progresso, salvamento, backup, diário, resumo de estudos | hook de progresso, query de resumos, barra de backup, status de salvamento |
| `auth` | Sessão, papel, login, logout, página de entrar | provider, hook de sessão, `RequireRole`, menu do usuário, rotas |
| `profiles` | Meu perfil (abas Perfil, Estudos e Conta), página pública de professor, tema | rotas, `ThemeSync` |
| `proposals` | Propor curso, minhas propostas, editar e retirar | rotas |
| `admin` | Visão geral, fila de propostas, cursos, pessoas e papéis, histórico | rotas |
| `legal` | Página de privacidade | rotas |
| `shared` | Cliente HTTP, erros de rede e de sessão, datas, texto, componentes genéricos | (importado por caminho) |
| `app` | Providers, router, layout | (ponto de entrada) |

O único acesso à rede é o `FetchHttpClient` (`shared/infra/http`): `credentials: 'same-origin'`, 401 vira `SessionExpiredError` e qualquer outra falha vira `HttpRequestError`, que carrega a mensagem escrita pela API (`problem`). Os repositórios e gateways HTTP de cada módulo validam as respostas com Zod antes de entregar algo ao domínio.

### Servidor (`server/` e `functions/`)

- `functions/api/` segue o roteamento por arquivo do Cloudflare Pages. Cada arquivo só chama um handler.
- `server/modules/<auth|courses|progress|profiles|proposals|admin>/` tem os handlers e as regras de cada assunto.
- Os handlers que exigem sessão usam `withSession`, que renova cookies e encerra a sessão quando o Supabase recusa o token. As chamadas de admin passam por `adminRpc`, que chama a função do banco e traduz os erros.
- `server/shared/` tem leitura da configuração, cookies, respostas HTTP, criptografia do PKCE e os clientes de Auth e REST do Supabase.
- `server/main/` monta os serviços por requisição e aplica o middleware (CSRF, cabeçalhos, tratamento de erro).

### Contratos (`contracts/`)

Schemas Zod usados pelos dois lados: conteúdo do curso, progresso, limites de tamanho, usuário autenticado, perfis, preferências, propostas e respostas da área de admin. O servidor valida tudo o que recebe do navegador e também o que volta do Supabase, para que uma coluna nova nunca vaze sem querer; o site valida o que recebe.

### Regras que o lint garante (`eslint.config.mjs`)

- `domain` não importa camadas externas nem bibliotecas (React, Zod, TanStack).
- `application` não importa `infra`, `main` nem `presentation`.
- `presentation` não importa `infra`.
- Um módulo só importa outro pelo `index.ts`.
- `src/` não importa `@supabase/*`, `server/` nem `functions/`, e não lê `import.meta.env`.
- `src/` não usa `localStorage`, `sessionStorage`, `indexedDB` nem `document.cookie`.
- `server/` e `functions/` não importam nada de `src/`.

### Onde está cada regra de negócio

| Regra | Arquivo |
|---|---|
| Distribuir aulas, exercícios e projeto pelos dias | `courses/domain/rules/plan/build-study-plan.rule.ts` e vizinhos |
| Horas por dia da semana | `courses/domain/rules/plan/hours-for-weekday.rule.ts` |
| Ritmo (à frente, atrás) | `courses/domain/rules/summary/calculate-pace.rule.ts` |
| Sequência e dias atrasados | `courses/domain/rules/summary/summarize-study-days.rule.ts` |
| Limites de texto e de entradas | `contracts/progress-limits.ts` |
| Renovação da sessão | `server/modules/auth/session/resolve-session.ts` |
| Quem pode fazer o quê | Políticas RLS e funções em `supabase/migrations/20261026200*.sql` |
| Aprovar proposta (papel, curso e histórico juntos) | função `approve_proposal` |
| Limite de propostas abertas | gatilho `course_proposals_limit_rows` |
| Último admin e curso com estudantes | funções `admin_set_role` e `admin_delete_course` |
| Resumo de estudos do perfil | `profiles/domain/rules/summarize-studies.rule.ts` |
| Endereço sugerido para o curso | `admin/domain/rules/suggest-course-slug.rule.ts` |

Os parâmetros do plano (semanas por mês, parcela de projeto, parcela de estudo) ficam em `courses/domain/constants/plan-tuning.ts`.

## 6. Fluxos principais

### Abrir um curso

1. A rota `/cursos/:slug` carrega a página sob demanda.
2. `useCourseDetailsQuery` chama o caso de uso `GetCourseBySlug`, que busca `/api/courses/:slug` e valida o conteúdo.
3. Sem sessão, a página mostra a prévia (descrição, módulos e guia) com o botão **Entrar com GitHub para começar**.
4. Com sessão, `useCourseProgress` carrega `/api/progress/:slug` e `useCourseDashboard` monta o plano (memorizado pela data de início) e os view models da tela.

### Salvar

```mermaid
sequenceDiagram
  participant UI as Tela
  participant Hook as useCourseProgress
  participant Cache as TanStack Query
  participant API as PUT /api/progress/:slug
  UI->>Hook: marcar item
  Hook->>Cache: atualiza na hora (otimista)
  Hook->>Hook: agenda gravação em 600 ms
  Hook->>API: progresso inteiro
  API->>API: valida com o schema e grava com o token da pessoa
  alt erro de rede ou 5xx
    Hook->>Hook: "Não foi possível salvar", tenta de novo em 15 s
  else 401
    Hook->>Hook: avisa que a sessão terminou e volta para a prévia
  end
  Note over Hook: pagehide e desmontagem forçam a gravação pendente (keepalive até 60 KB)
```

## 7. Modelo de dados

```sql
profiles (
  id                 uuid primary key -> auth.users, on delete cascade
  role               text check in ('student', 'teacher', 'admin')
  handle             text unique, login do GitHub normalizado
  display_name, avatar_url (só GitHub), bio, links (até 5), show_student_count
  created_at, updated_at
)

account_settings (
  user_id  uuid primary key -> auth.users
  timezone, theme check in ('system', 'light', 'dark'), notify jsonb
)

courses (
  slug        text primary key check '^[a-z0-9-]{1,60}$'
  content     jsonb  check objeto, slug igual ao da linha, até 1 MB
  published   boolean default false
  listed      boolean default true
  owner_id    uuid -> profiles, on delete set null
  title       text gerado de content
  version     text gerado de content
  created_at, updated_at
)

course_progress (
  user_id     uuid  -> auth.users, on delete cascade
  course_slug text  -> courses.slug, on update cascade, on delete restrict
  data        jsonb check objeto, até 2 MB
  updated_at  timestamptz definido pelo servidor
  primary key (user_id, course_slug)
)

course_proposals (
  id, author_id -> profiles, status, title, summary, audience, area, language,
  outline jsonb (títulos), experience, sample_url, suggested_slug,
  review_note, reviewed_by, reviewed_at, course_slug -> courses
)

audit_log (
  id, at, actor_id -> profiles, action, target_type, target_id, data jsonb (só ids e valores)
)
```

- `profiles`: a pessoa lê o próprio perfil; qualquer um lê perfis de professor; admin lê todos. A pessoa edita só nome, texto, links e a opção de contagem. O perfil nasce por gatilho no cadastro e, se faltar, `ensure_profile()` cria na próxima visita.
- `courses`: leitura dos publicados por qualquer um; o dono e os admins também veem rascunhos. Ninguém escreve direto pela API: só as funções de admin, que gravam o histórico. O script de importação usa a chave secreta e roda só na máquina de quem mantém a plataforma, até o editor substituí-lo.
- `course_progress`: cada pessoa lê e grava só as próprias linhas. Nenhuma política dá acesso a admin.
- `course_proposals`: o autor vê e edita as próprias enquanto estão abertas; admin vê todas. Status e resposta mudam só pelas funções de análise.
- `audit_log`: sem acesso pela API; escrita e leitura só por funções.
- Guardar um documento por curso evita joins, simplifica o backup e cabe no padrão de acesso (sempre lido e gravado inteiro).

## 8. Escala e confiabilidade

| Tema | Situação atual | Limite conhecido |
|---|---|---|
| Leitura de conteúdo | `/api/courses` com `s-maxage=300` na borda | Atualização de curso leva alguns minutos para aparecer |
| Invocações das functions | Só `/api/*` passa pelas functions (`_routes.json`) | Plano gratuito: 100 mil requisições por dia |
| Área de admin | Funções com `limit` e paginação (50 por página) | Busca por nome sem índice de texto; basta até dezenas de milhares de perfis |
| Escrita de progresso | Uma linha por pessoa por curso, gravação com debounce | Plano gratuito do Supabase: 500 MB de banco |
| Supabase pausado (7 dias sem uso no plano gratuito) | Login e progresso falham com mensagem clara | Projeto precisa ser reativado no painel |
| Conflito entre aparelhos | Última gravação vence | Edição simultânea em dois aparelhos perde a mais antiga |
| Atualização do site | Chunks novos com hash e cache imutável | Aba antiga pode falhar ao carregar rota; a tela de erro sugere recarregar |

## 9. Trade-offs principais

- **BFF com cookies** em vez de cliente Supabase no navegador: tokens fora do alcance de XSS e CSP fechada em `'self'`, ao custo de uma camada a mais para manter e de depender do Cloudflare.
- **Login obrigatório** em vez de modo visitante: nada de dados pessoais no navegador e um único caminho de código, ao custo de exigir conta do GitHub para estudar.
- **Conteúdo no Supabase** em vez de embutido no bundle: cursos publicados sem novo deploy, ao custo de uma requisição para abrir cada curso.
- **Supabase** em vez de banco próprio: Auth, RLS e backups prontos, ao custo de depender do plano gratuito.
- **Documento JSON por curso**: simples e rápido, sem consultas analíticas.
- **Última gravação vence**: simples e suficiente para uso individual.
- **Papel na tabela `profiles`** em vez do `app_metadata` do token: vale na hora e muda sem a chave secreta, ao custo de uma consulta a mais nas políticas (feita por uma função em cache por consulta).
- **Mudanças de estado por funções do banco** em vez de várias chamadas da API: tudo ou nada, com histórico na mesma transação, ao custo de regras escritas em SQL.

## 10. O que revisar quando crescer

- **Uso em vários aparelhos ao mesmo tempo**: enviar o `updatedAt` lido e recusar gravação mais antiga (concorrência otimista), ou gravar alterações por item.
- **Limite de requisições**: um rate limit por IP ou por usuário nas functions (Cloudflare Rate Limiting) se aparecer abuso.
- **Editor de cursos**: próxima etapa. Rascunho e versões em tabelas próprias, revisão pelo admin e fim da importação com a chave secreta.
- **Avisos por e-mail**: as preferências já ficam guardadas; falta escolher um provedor de e-mail e disparar os avisos.
- **Mais provedores de login**: o provedor é escolhido num lugar só (`server/shared/supabase/auth/supabase-auth-client.ts`); basta receber o provedor na rota de login, habilitar no Supabase e adicionar o botão.
- **Estatísticas para professores**: funções que devolvem só números somados, com um mínimo de pessoas por número, nunca a tabela inteira.
- **Plano pago do Supabase** quando a pausa por inatividade ou o limite de 500 MB virarem problema.

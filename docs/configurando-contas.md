# Configurando contas com Supabase e GitHub

A plataforma exige login para estudar. Este guia cria o banco, liga o login com GitHub e mostra onde cada chave pode ficar.

## Onde fica cada chave

| Chave | Onde pode ficar | Onde nunca pode ficar |
|---|---|---|
| URL do projeto | Cloudflare, `.dev.vars`, `.env.local` | (não é segredo) |
| Chave publicável (`sb_publishable_...`) | Cloudflare e `.dev.vars` | código do site, repositório |
| Chave secreta (`sb_secret_...`) | só no `.env.local` de quem importa cursos | Cloudflare, repositório, qualquer coisa publicada |
| Client secret do OAuth App | só no painel do Supabase | qualquer outro lugar |

O navegador não recebe nenhuma delas. Ele fala só com `/api`, e as functions usam a chave publicável junto com o token da pessoa, então o Row Level Security continua decidindo o que cada um pode ler e gravar.

## 1. Crie o projeto no Supabase

1. Em [supabase.com](https://supabase.com), crie um projeto no plano gratuito. Escolha a região mais próxima do seu público (por exemplo, São Paulo).
2. Guarde a senha do banco num gerenciador de senhas. Ela não vai para o código.

## 2. Crie as tabelas com RLS

As migrations ficam em `supabase/migrations/` e precisam rodar na ordem do nome:

1. `20261026120000_course_progress.sql`: progresso de cada pessoa por curso.
2. `20261026190000_courses.sql`: conteúdo dos cursos, leitura pública dos publicados.
3. `20261026200000_profiles_and_roles.sql`: perfis, papéis, preferências da conta e o gatilho que cria o perfil no cadastro.
4. `20261026200100_audit_log.sql`: histórico das ações de admin.
5. `20261026200200_course_ownership.sql`: dono do curso, curso fora do catálogo e escrita em `courses` só por funções.
6. `20261026200300_course_proposals.sql`: propostas de curso.
7. `20261026200400_admin_rpcs.sql`: funções da análise de propostas e da área de admin.

Se o projeto já estava no ar, aplique as migrations novas **antes** de publicar o código novo. O site antigo continua funcionando com o banco novo.

Escolha um caminho:

- **Painel**: abra **SQL Editor**, cole e execute cada arquivo, na ordem.
- **CLI**:

  ```bash
  npx supabase login
  npx supabase init          # mantém a pasta supabase/migrations existente
  npx supabase link --project-ref SEU_PROJECT_REF
  npx supabase db push
  ```

Depois confira em **Advisors > Security Advisor** que não há aviso de tabela sem RLS.

Para rodar os testes de RLS localmente (precisa de Docker):

```bash
npx supabase start
npx supabase test db
```

## 3. Crie o OAuth App no GitHub

1. GitHub: **Settings > Developer settings > OAuth Apps > New OAuth App**.
2. **Homepage URL**: o endereço do site, por exemplo `https://plataforma-cursos.pages.dev`.
3. **Authorization callback URL**: `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback` (o painel do Supabase mostra esse endereço na tela do provedor GitHub).
4. Gere um **Client secret**. Ele vai **só** para o painel do Supabase.

## 4. Configure a autenticação no Supabase

Em **Authentication**:

1. **Sign In / Providers > GitHub**: ative e cole o Client ID e o Client secret.
2. **Sign In / Providers > Email**: **desative**. Com ele ativo, qualquer pessoa pode criar contas por e-mail direto pela API do Supabase.
3. Confira que **Anonymous sign-ins** está desativado.
4. **URL Configuration**:
   - **Site URL**: o endereço do site, por exemplo `https://plataforma-cursos.pages.dev`.
   - **Redirect URLs**: só as rotas de retorno da API que você usa:
     - `https://plataforma-cursos.pages.dev/api/auth/callback`
     - `http://localhost:5173/api/auth/callback` (desenvolvimento)

   Evite curingas amplos como `https://*.pages.dev/**`: eles deixariam outro site receber o código de login.
5. **Sessions**: o tempo padrão do token de acesso (1 hora) funciona bem. As functions renovam a sessão sozinhas, e o cookie de renovação dura 30 dias.
6. **Rate Limits**: mantenha os limites padrão ou reduza; o login só acontece algumas vezes por pessoa.

## 5. Pegue as chaves

Em **Project Settings > API Keys**:

- Copie a **Publishable key** (`sb_publishable_...`). Ela vai para o Cloudflare e para o `.dev.vars`.
- A **Secret key** (`sb_secret_...`) só é usada para importar cursos, na sua máquina. Se tiver dúvida, não copie agora; dá para pegar quando for importar.

## 6. Rodando local

Crie `.dev.vars` a partir do exemplo (o arquivo é ignorado pelo git):

```bash
cp .dev.vars.example .dev.vars
```

```bash
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Rode `npm run dev`, que sobe a API e o site juntos. Abra `http://localhost:5173` e clique em **Entrar**.

## 7. Importe os cursos

Crie `.env.local` a partir de `.env.example`, com a URL e a chave **secreta**:

```bash
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

```bash
npm run content:import -- supabase/seed/courses/engenharia-de-ia.json --publish
```

O script valida o curso com o mesmo schema do site antes de enviar. Depois da primeira importação, valide a ligação entre progresso e cursos:

```sql
alter table public.course_progress validate constraint course_progress_course_fk;
```

O script continua funcionando até o editor de cursos chegar: ele usa a chave secreta e não passa pelas regras de papel.

## 8. Primeira pessoa admin

Depois das migrations não existe nenhum admin. Entre no site uma vez com a sua conta do GitHub e rode no **SQL Editor** do Supabase, trocando pelo seu login do GitHub em minúsculas:

```sql
update public.profiles set role = 'admin' where handle = 'seu-login-do-github';
```

Opcional, para aparecer como professor do curso que já existe:

```sql
update public.courses
set owner_id = (select id from public.profiles where handle = 'seu-login-do-github')
where slug = 'engenharia-de-ia';
```

O SQL Editor roda com o usuário dono do banco, por isso pode mudar o papel. Pela API ninguém consegue: a pessoa só edita nome, texto e links do próprio perfil. Depois disso, os outros papéis mudam pela tela **Admin > Pessoas e papéis**, e cada mudança fica no histórico.

Quem já tinha `app_metadata.role = 'admin'` vira admin automaticamente na migration. O `app_metadata` deixa de ser usado nas políticas.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `/api/me` responde 503 | Variáveis ausentes no Cloudflare ou no `.dev.vars`, URL sem `https` ou chave secreta no lugar da publicável |
| Volta do GitHub para `/entrar?erro=login` | Rota `/api/auth/callback` fora das **Redirect URLs**, login cancelado ou demora de mais de 10 minutos para concluir |
| Login funciona mas o progresso não salva | Migrations não aplicadas, curso não importado ou RLS bloqueando (confira os logs da Data API) |
| Catálogo vazio | Curso importado sem `--publish` ou tirado do catálogo na área de admin |
| Área de admin mostra "Você não tem acesso" | Papel ainda não é `admin` (rode o SQL da seção 8) ou o login foi feito antes da mudança; saia e entre de novo |
| Erro ao enviar proposta | Limite de 3 propostas abertas atingido, ou migrations novas não aplicadas |
| Login não fica salvo em `localhost` | Navegador que não aceita cookie `__Host-` sem HTTPS (use Chrome ou Firefox) ou site aberto na porta 8788 em vez de 5173 durante o `dev` |
| Tudo parou de funcionar depois de dias sem uso | Projeto gratuito pausado; reative no painel |

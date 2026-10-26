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
2. `20261026190000_courses.sql`: conteúdo dos cursos, leitura pública dos publicados e escrita só por admin.

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

### Pessoa admin (opcional)

A escrita na tabela `courses` pela API exige `app_metadata.role = 'admin'` no token. Hoje só o script de importação escreve, e ele usa a chave secreta, então isso não é necessário. Se um dia houver uma tela de edição, marque a pessoa pelo SQL Editor:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
where id = 'ID_DA_PESSOA';
```

O `app_metadata` só muda com acesso de administrador ao banco; a própria pessoa não consegue se promover.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `/api/me` responde 503 | Variáveis ausentes no Cloudflare ou no `.dev.vars`, URL sem `https` ou chave secreta no lugar da publicável |
| Volta do GitHub para `/entrar?erro=login` | Rota `/api/auth/callback` fora das **Redirect URLs**, login cancelado ou demora de mais de 10 minutos para concluir |
| Login funciona mas o progresso não salva | Migrations não aplicadas, curso não importado ou RLS bloqueando (confira os logs da Data API) |
| Catálogo vazio | Curso importado sem `--publish` |
| Login não fica salvo em `localhost` | Navegador que não aceita cookie `__Host-` sem HTTPS (use Chrome ou Firefox) ou site aberto na porta 8788 em vez de 5173 durante o `dev` |
| Tudo parou de funcionar depois de dias sem uso | Projeto gratuito pausado; reative no painel |

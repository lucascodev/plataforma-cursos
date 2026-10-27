# Migrations do banco

Toda mudança no banco é um arquivo SQL novo em `supabase/migrations/`. Ninguém precisa colar SQL no painel do Supabase: o CI aplica as migrations do zero num banco local, roda os testes e, a cada push na `main`, aplica as pendentes em produção antes do deploy.

O Supabase CLI guarda em produção, na tabela `supabase_migrations.schema_migrations`, quais arquivos já rodaram. Cada arquivo roda uma vez só, dentro de uma transação: se der erro, nada daquele arquivo fica aplicado.

## Comandos

Precisa de Docker para os comandos locais.

| Comando | O que faz |
|---|---|
| `pnpm db:start` | Sobe o Supabase local (banco, API e Auth) |
| `pnpm db:stop` | Para o Supabase local |
| `pnpm db:new <nome>` | Cria `supabase/migrations/<data>_<nome>.sql` vazio |
| `pnpm db:reset` | Recria o banco local: roda todas as migrations do zero e o `supabase/seed.sql` |
| `pnpm db:test` | Roda os testes pgTAP de `supabase/tests/` |
| `pnpm db:lint` | Procura erros no schema (funções que não compilam, tipos errados) |
| `pnpm db:seed` | Regera `supabase/seed.sql` a partir de `supabase/seed/courses/*.json` |
| `pnpm db:status` | Compara as migrations do repositório com as do projeto linkado |
| `pnpm db:push` | Aplica as pendentes no projeto linkado (normalmente quem faz isso é o CI) |

Para subir sem os serviços que o projeto não usa:

```bash
pnpm exec supabase start -x studio,imgproxy,realtime,storage-api,edge-runtime,logflare,vector,mailpit,postgres-meta,supavisor
```

## Escrevendo uma migration

1. `pnpm db:new nome-curto-em-ingles`.
2. Escreva o SQL. Tabela nova sempre com `enable row level security`, `force row level security`, `revoke all` e só os grants necessários. Função `security definer` sempre com `set search_path = ''` e `revoke execute ... from public, anon`.
3. Escreva o teste em `supabase/tests/<assunto>.test.sql`. Ele roda dentro de uma transação desfeita no fim, então pode criar e apagar o que quiser.
4. `pnpm db:reset && pnpm db:test && pnpm db:lint`.

Regras:

- **Nunca edite uma migration que já foi para a `main`.** Ela já rodou em produção e não roda de novo. Corrija com uma migration nova.
- **Compatível com o código que está no ar.** O banco muda antes do deploy, então por alguns minutos o código antigo roda com o banco novo. Acrescente colunas, tabelas e parâmetros com valor padrão; remova ou renomeie só no release seguinte, quando nenhum código usa mais a forma antiga.
- **Não existe rollback.** Se uma migration causou problema, a correção é outra migration.
- **Dado de pessoa nunca é apagado para a migration passar.** Se uma regra nova não vale para linhas antigas, valide só quando todas estiverem certas (veja `20261027090000_validate_progress_course_fk.sql`).

## O que acontece no CI

Arquivo `.github/workflows/ci.yml`:

| Job | Quando | O que faz |
|---|---|---|
| `checks` | Todo push e PR | Tipos, lint, testes, schema e seed atualizados, build e auditoria |
| `db` | Todo push e PR | Sobe o Supabase local, `db:reset`, `db:test` e `db:lint` |
| `release` | Push na `main`, se os dois passaram | `db push --dry-run`, `db push` e depois o Deploy Hook do Cloudflare |

O `release` só chama o deploy se a `main` ainda estiver no commit que ele migrou. Se alguém já empurrou outro commit, a execução desse outro commit aplica as migrations dele e faz o deploy. As execuções do `release` entram numa fila (`concurrency: production`) e nunca rodam ao mesmo tempo.

## Configuração inicial da pipeline (uma vez)

### 1. Marque as migrations que já estão em produção

As migrations de `20261026120000` a `20261026200400` foram coladas no SQL Editor, então o histórico do Supabase não sabe que elas rodaram. Sem este passo, o primeiro `db push` tentaria rodá-las de novo e falharia.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase migration repair --status applied \
  20261026120000 20261026190000 20261026200000 20261026200100 \
  20261026200200 20261026200300 20261026200400
pnpm db:status
```

O `db:status` deve mostrar as sete nas duas colunas (local e remoto) e as novas só na coluna local. Elas vão para produção no próximo push na `main`.

Antes do `repair`, confirme que as sete estão mesmo aplicadas: em **Database > Functions** do painel, a função `admin_list_audit` precisa existir.

### 2. Crie o environment `production` no GitHub

Em **Settings > Environments > New environment**, crie `production`. Opcional: em **Deployment branches**, deixe só `main`.

Cadastre estes **secrets** no environment:

| Secret | Onde pegar |
|---|---|
| `SUPABASE_DB_URL` | **Connect > Direct > Session pooler** no painel (porta 5432), com `[YOUR-PASSWORD]` trocado pela senha do banco, sem colchetes. Caracteres especiais da senha vão codificados (`@` vira `%40`, `#` vira `%23`) |
| `CLOUDFLARE_DEPLOY_HOOK` | URL do Deploy Hook, veja [deploy.md](deploy.md#deploy-pela-pipeline) |

Com o pooler, a pipeline não precisa de access token: o `db push --db-url` conecta direto no Postgres. O host direto do banco só tem IPv6 e o runner do GitHub não, por isso o pooler.

Sem `SUPABASE_DB_URL`, o job cai no caminho com `supabase link`, que pede mais três secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` e `SUPABASE_DB_PASSWORD`. O token precisa da permissão **API Key Secrets: Read**, porque o `link` lê as chaves do projeto, e ele expira.

### 3. Desligue o deploy automático do Cloudflare

Siga [deploy.md](deploy.md#deploy-pela-pipeline). Enquanto o Cloudflare continuar publicando sozinho a cada push, o código pode sair antes das migrations.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `release` falha em `supabase link` ou `db push` com erro de rede | O host direto do banco só tem IPv6 e o runner do GitHub não. Cadastre `SUPABASE_DB_URL` (passo 2) |
| `supabase link` falha com "Authorization failed for the access token and project ref pair" | O token não tem **API Key Secrets: Read**. Prefira cadastrar `SUPABASE_DB_URL`, que dispensa o token |
| `db push --db-url` falha com erro de autenticação | A senha na URL tem caractere especial sem codificar, ou ficou com os colchetes |
| `db push` quer aplicar as migrations antigas | O passo 1 não foi feito no projeto certo |
| `db push` falha em uma migration nova | O erro desfaz só aquele arquivo. Corrija com uma migration nova; não edite a que falhou se ela já está na `main` |
| `db` falha no CI mas passa na sua máquina | Rode `pnpm db:reset` antes do `pnpm db:test`: o teste depende do banco recriado do zero |
| `checks` reclama do `seed.sql` | Rode `pnpm db:seed` e faça commit do arquivo gerado |

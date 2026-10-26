# 0001. Migrations em SQL aplicadas pelo Supabase CLI

- Status: aceita
- Data: 2026-10-27

## Contexto

As migrations de `supabase/migrations/` eram coladas à mão no SQL Editor do Supabase. Nada garantia a ordem, nada registrava o que já tinha rodado e os testes de RLS nunca rodavam no CI. O schema é escrito em SQL puro: políticas de RLS, column grants, funções `security definer`, triggers e `revoke execute`. O servidor não usa ORM: chama o PostgREST com o token de cada pessoa.

## Decisão

Manter as migrations como arquivos SQL e aplicá-las com o Supabase CLI, instalado como devDependency com versão fixa. Os comandos ficam em `pnpm db:*`. O CI recria o banco do zero a cada push (`db reset`), roda os testes pgTAP e o lint, e só então o job `release` faz `db push` em produção.

## Alternativas consideradas

- Drizzle (ou outro ORM com migrations): o schema dele não representa bem RLS, grants por coluna e funções `security definer`. Teríamos duas fontes de verdade, e o app não usa o ORM em nenhum outro lugar.
- Continuar colando no SQL Editor: sem histórico, sem ordem garantida e sem teste antes de chegar a produção.
- Script próprio com `psql`: repetiria o que o CLI já faz, inclusive o histórico em `supabase_migrations.schema_migrations`.

## Consequências

- Positivas: um histórico só, testes de RLS antes de toda mudança e nenhum SQL manual.
- Negativas: o CLI baixa um binário no `postinstall` (liberado em `pnpm-workspace.yaml`) e os testes locais exigem Docker.
- O que muda no código: `supabase/config.toml`, `supabase/seed.sql` gerado por `pnpm db:seed`, o job `db` no CI e a regra de nunca editar uma migration que já está na `main` ([migracoes.md](../migracoes.md)).

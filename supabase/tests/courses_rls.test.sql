-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated');

insert into public.courses (slug, content, published)
values
  ('publicado', '{"slug": "publicado", "title": "Publicado"}', true),
  ('rascunho', '{"slug": "rascunho", "title": "Rascunho"}', false);

set local role anon;
select results_eq($$ select slug from public.courses order by slug $$, $$ values ('publicado') $$, 'visitante lê só os publicados');
select throws_ok($$ insert into public.courses (slug, content) values ('x', '{"slug": "x"}') $$, '42501', null, 'visitante não escreve');

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select results_eq($$ select slug from public.courses order by slug $$, $$ values ('publicado') $$, 'pessoa comum não vê rascunhos');
select throws_ok($$ insert into public.courses (slug, content) values ('x', '{"slug": "x"}') $$, '42501', null, 'pessoa comum não cria curso');
select results_eq(
  $$ with changed as (update public.courses set published = false returning 1) select count(*)::int from changed $$,
  $$ values (0) $$,
  'pessoa comum não altera curso'
);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "app_metadata": {"role": "admin"}}';
select results_eq($$ select count(*)::int from public.courses $$, $$ values (2) $$, 'admin vê rascunhos');
select lives_ok($$ insert into public.courses (slug, content) values ('novo', '{"slug": "novo", "title": "Novo"}') $$, 'admin cria curso');
select throws_ok($$ insert into public.courses (slug, content) values ('a', '{"slug": "b"}') $$, '23514', null, 'slug do documento precisa bater com a chave');

select * from finish();
rollback;

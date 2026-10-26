-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, email, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated');

update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

insert into public.courses (slug, content, published, listed, owner_id)
values
  ('publicado', '{"slug": "publicado", "title": "Publicado"}', true, true, null),
  ('fora-do-catalogo', '{"slug": "fora-do-catalogo", "title": "Fora do catálogo"}', true, false, null),
  ('rascunho', '{"slug": "rascunho", "title": "Rascunho"}', false, true, '22222222-2222-2222-2222-222222222222');

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select results_eq(
  $$ select slug from public.courses order by slug $$,
  $$ values ('fora-do-catalogo'), ('publicado') $$,
  'visitante lê os publicados, inclusive fora do catálogo (abre pelo link)'
);
select throws_ok($$ insert into public.courses (slug, content) values ('x', '{"slug": "x"}') $$, '42501', null, 'visitante não escreve');

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select results_eq(
  $$ select slug from public.courses order by slug $$,
  $$ values ('fora-do-catalogo'), ('publicado') $$,
  'pessoa comum não vê rascunhos'
);
select throws_ok($$ insert into public.courses (slug, content) values ('x', '{"slug": "x"}') $$, '42501', null, 'pessoa comum não cria curso');
select throws_ok($$ update public.courses set published = false $$, '42501', null, 'pessoa comum não altera curso');

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select results_eq(
  $$ select slug from public.courses where not published $$,
  $$ values ('rascunho') $$,
  'a dona vê o próprio rascunho'
);
select throws_ok($$ update public.courses set published = true where slug = 'rascunho' $$, '42501', null, 'a dona não publica direto na tabela');

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select results_eq($$ select count(*)::int from public.courses $$, $$ values (3) $$, 'admin vê todos os cursos');
select throws_ok(
  $$ insert into public.courses (slug, content) values ('novo', '{"slug": "novo"}') $$,
  '42501', null, 'nem admin escreve direto: só pelas funções com auditoria'
);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "app_metadata": {"role": "admin"}}';
select results_eq(
  $$ select count(*)::int from public.courses where not published $$,
  $$ values (0) $$,
  'app_metadata no token não dá mais acesso de admin'
);

reset role;
select throws_ok($$ insert into public.courses (slug, content) values ('a', '{"slug": "b"}') $$, '23514', null, 'slug do documento precisa bater com a chave');

select * from finish();
rollback;

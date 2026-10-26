-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated');

insert into public.courses (slug, content, published)
values ('engenharia-de-ia', '{"slug": "engenharia-de-ia", "title": "Engenharia de IA"}', true);

select has_table('public', 'course_progress', 'a tabela existe');
select results_eq(
  $$ select relrowsecurity from pg_class where oid = 'public.course_progress'::regclass $$,
  $$ values (true) $$,
  'RLS está ligado'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.course_progress (course_slug, data) values ('engenharia-de-ia', '{"completedItems": {}}') $$,
  'Ana grava o próprio progresso'
);

select throws_ok(
  $$ insert into public.course_progress (user_id, course_slug, data)
     values ('22222222-2222-2222-2222-222222222222', 'engenharia-de-ia', '{}') $$,
  '42501',
  null,
  'Ana não grava em nome da Bia'
);

select throws_ok(
  $$ insert into public.course_progress (course_slug, data) values ('Slug Inválido!', '{}') $$,
  '23514',
  null,
  'slug fora do formato é recusado'
);

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is_empty($$ select * from public.course_progress $$, 'Bia não lê o progresso da Ana');

select results_eq(
  $$ with changed as (update public.course_progress set data = '{}' returning 1) select count(*)::int from changed $$,
  $$ values (0) $$,
  'Bia não altera o progresso da Ana'
);

select results_eq(
  $$ with removed as (delete from public.course_progress returning 1) select count(*)::int from removed $$,
  $$ values (0) $$,
  'Bia não apaga o progresso da Ana'
);

reset role;
set local role anon;
select throws_ok($$ select * from public.course_progress $$, '42501', null, 'visitante sem login não acessa a tabela');

select * from finish();
rollback;

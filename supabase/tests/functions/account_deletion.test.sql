-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated', '{"user_name": "caio"}');

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';
insert into public.courses (slug, owner_id, content, published)
values ('curso-da-ana', '11111111-1111-1111-1111-111111111111', '{"slug": "curso-da-ana", "title": "Curso"}', false);

insert into public.course_progress (user_id, course_slug, data)
values ('22222222-2222-2222-2222-222222222222', 'engenharia-de-ia', '{"journal": {"2026-10-01": "nota"}}');
insert into public.course_proposals (author_id, title, summary, audience, area, outline)
values ('22222222-2222-2222-2222-222222222222', 'Curso da Bia', 'Resumo', 'Todos', 'Dados', '["Um"]');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok($$ select public.delete_my_account() $$, 'PT409', null, 'dona de curso não exclui a conta');

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok($$ select public.delete_my_account() $$, 'PT409', null, 'a última pessoa admin não exclui a conta');

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select public.delete_my_account() $$, '42501', null, 'visitante não chama a função');

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select lives_ok($$ select public.delete_my_account() $$, 'estudante exclui a própria conta');

reset role;
select is((select count(*)::integer from public.profiles where id = '22222222-2222-2222-2222-222222222222'), 0, 'o perfil some');
select is(
  (select count(*)::integer from public.course_progress where user_id = '22222222-2222-2222-2222-222222222222')
    + (select count(*)::integer from public.course_proposals where author_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'progresso e propostas somem junto'
);
select results_eq(
  $$ select actor_id is null from public.audit_log where action = 'account.deleted' $$,
  $$ values (true) $$,
  'o histórico guarda a exclusão sem guardar a pessoa'
);

select * from finish();
rollback;

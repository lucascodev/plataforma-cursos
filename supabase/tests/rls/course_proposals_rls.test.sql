-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, email, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated');

update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Python do zero', 'Curso prático', 'Iniciantes', 'Programação', '["Básico", "Projeto"]') $$,
  'Ana envia uma proposta'
);
select throws_ok(
  $$ insert into public.course_proposals (id, title, summary, audience, area, outline)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Com id', 'Resumo', 'Todos', 'Dados', '["M1"]') $$,
  '42501', null, 'o id é sempre gerado pelo banco'
);

-- Fixed id so the rest of the test can refer to Ana's proposal.
reset role;
update public.course_proposals set id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' where title = 'Python do zero';
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline, status)
     values ('Outro curso', 'Resumo', 'Todos', 'Dados', '["M1"]', 'approved') $$,
  '42501', null, 'ninguém cria proposta já aprovada'
);
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Outro curso', 'Resumo', 'Todos', 'Dados', '[1, 2]') $$,
  '23514', null, 'o esboço é uma lista de títulos'
);
select lives_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Curso 2', 'Resumo', 'Todos', 'Dados', '["M1"]'), ('Curso 3', 'Resumo', 'Todos', 'Dados', '["M1"]') $$,
  'Ana fica com 3 propostas abertas'
);
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Curso 4', 'Resumo', 'Todos', 'Dados', '["M1"]') $$,
  'PT409', null, 'a quarta proposta aberta é recusada'
);
select throws_ok(
  $$ update public.course_proposals set status = 'approved' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  '42501', null, 'o autor não muda o status'
);

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select is_empty($$ select 1 from public.course_proposals $$, 'Bia não vê propostas de Ana');
select results_eq(
  $$ with changed as (update public.course_proposals set title = 'Invadido' returning 1) select count(*)::int from changed $$,
  $$ values (0) $$,
  'Bia não edita propostas de Ana'
);

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select results_eq($$ select count(*)::int from public.course_proposals $$, $$ values (3) $$, 'admin vê todas as propostas');
select lives_ok(
  $$ select public.review_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'changes_requested', 'Detalhe o projeto final') $$,
  'admin pede ajustes'
);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
update public.course_proposals set summary = 'Curso prático com projeto final' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
select results_eq(
  $$ select status from public.course_proposals where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  $$ values ('pending'::text) $$,
  'editar depois do pedido de ajustes devolve a proposta para a fila'
);

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'python-do-zero', null);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select results_eq(
  $$ with changed as (update public.course_proposals set title = 'Mudado' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' returning 1)
     select count(*)::int from changed $$,
  $$ values (0) $$,
  'proposta aprovada não muda mais'
);

reset role;
select results_eq(
  $$ select count(*)::int from public.audit_log where action = 'proposal.submitted' $$,
  $$ values (3) $$,
  'cada envio fica no histórico'
);

select * from finish();
rollback;

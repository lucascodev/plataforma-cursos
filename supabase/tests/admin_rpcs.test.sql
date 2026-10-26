-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

-- Each test owns the rows it reads: the local seed is removed here and comes back when the transaction rolls back.
delete from public.courses;

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated', '{"user_name": "caio"}');

update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

insert into public.course_proposals (id, author_id, title, summary, audience, area, outline)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Python do zero', 'Curso prático', 'Iniciantes', 'Programação', '["Básico"]'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'SQL na prática', 'Consultas', 'Analistas', 'Dados', '["Select"]');

insert into public.courses (slug, content, published)
values ('existente', '{"slug": "existente", "title": "Existente"}', true);

-- Students cannot call admin functions.
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select public.admin_overview() $$, '42501', null, 'estudante não abre a visão geral');
select throws_ok($$ select public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'x', null) $$, '42501', null, 'estudante não aprova proposta');
select throws_ok($$ select public.admin_set_role('22222222-2222-2222-2222-222222222222', 'admin') $$, '42501', null, 'estudante não se promove');
select throws_ok($$ select public.withdraw_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$, 'PT404', null, 'só o autor retira a proposta');

reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select public.admin_list_courses() $$, '42501', null, 'visitante não chama funções de admin');

-- Admin flow.
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok($$ select public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'existente', null) $$, 'PT409', null, 'endereço já usado é recusado');
select throws_ok($$ select public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Com Espaço', null) $$, 'PT422', null, 'endereço inválido é recusado');
select throws_ok($$ select public.review_proposal('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'refused', '  ') $$, 'PT422', null, 'recusar exige um motivo');
select is(
  public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'python-do-zero', 'Bem-vinda') ->> 'courseSlug',
  'python-do-zero',
  'admin aprova a proposta'
);

reset role;
select results_eq(
  $$ select role from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('teacher'::text) $$,
  'quem propôs vira professora'
);
select results_eq(
  $$ select owner_id::text, published from public.courses where slug = 'python-do-zero' $$,
  $$ values ('11111111-1111-1111-1111-111111111111'::text, false) $$,
  'o curso nasce como rascunho da professora'
);
select results_eq(
  $$ select status, course_slug from public.course_proposals where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  $$ values ('approved'::text, 'python-do-zero'::text) $$,
  'a proposta fica aprovada e ligada ao curso'
);
select results_eq(
  $$ select action from public.audit_log where action in ('role.changed', 'proposal.approved') order by id $$,
  $$ values ('role.changed'::text), ('proposal.approved'::text) $$,
  'aprovação e troca de papel vão para o histórico'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok($$ select public.approve_proposal('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'outro', null) $$, 'PT409', null, 'proposta já aprovada não é aprovada de novo');
select throws_ok($$ select public.admin_set_role('33333333-3333-3333-3333-333333333333', 'student') $$, 'PT409', null, 'o último admin não é rebaixado');
select throws_ok($$ select public.admin_set_role('11111111-1111-1111-1111-111111111111', 'student') $$, 'PT409', null, 'dona de curso não volta a estudante');
select lives_ok($$ select public.admin_set_role('22222222-2222-2222-2222-222222222222', 'teacher') $$, 'admin promove alguém a professor');

-- Courses with students are kept.
reset role;
insert into public.course_progress (user_id, course_slug, data)
values ('22222222-2222-2222-2222-222222222222', 'existente', '{"journal": {"2027-01-10": "anotação pessoal"}}');
set local role authenticated;
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok($$ select public.admin_delete_course('existente') $$, 'PT409', null, 'curso com estudantes não é apagado');
select lives_ok($$ select public.admin_set_course_listed('existente', false) $$, 'curso com estudantes sai do catálogo');
select is_empty($$ select 1 from public.course_progress $$, 'admin não lê o progresso, as notas nem o diário de ninguém');
select is(
  (public.admin_list_courses() -> 0 ->> 'studentCount') is not null,
  true,
  'admin vê só a contagem de estudantes'
);

-- Public teacher profile.
reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is(public.public_teacher_profile('ana') -> 'studentCount', 'null'::jsonb, 'contagem de estudantes escondida por padrão');
select is(public.public_teacher_profile('caio'), null, 'admin sem curso publicado não tem página pública');

reset role;
update public.profiles set show_student_count = true where handle = 'ana';
update public.courses set published = true where slug = 'python-do-zero';
set local role anon;
select is((public.public_teacher_profile('ana') ->> 'studentCount')::int, 0, 'contagem aparece quando a professora permite');

select * from finish();
rollback;

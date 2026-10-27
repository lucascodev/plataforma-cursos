-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated', '{"user_name": "caio"}');

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';
insert into public.courses (slug, owner_id, content, published)
values ('curso-da-ana', '11111111-1111-1111-1111-111111111111', '{"slug": "curso-da-ana", "title": "Curso da Ana"}', false);
insert into public.course_versions (id, course_slug, status, semver, kind, content, submitted_at)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'curso-da-ana', 'in_review', '1.0.0', 'first', '{"slug": "curso-da-ana"}', now());
insert into public.course_progress (user_id, course_slug, data)
values ('22222222-2222-2222-2222-222222222222', 'engenharia-de-ia', '{"completedItems": {"m1-t0": true}}');
insert into public.course_proposals (author_id, title, summary, audience, area, outline)
values ('22222222-2222-2222-2222-222222222222', 'Curso da Bia', 'Resumo', 'Todos', 'Dados', '["Um"]');
insert into public.profile_reports (profile_id, reporter_id, reason) values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'other');

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select public.admin_nav_badges() $$, '42501', null, 'estudante não vê os contadores');
select throws_ok($$ select public.admin_set_blocked('11111111-1111-1111-1111-111111111111', true) $$, '42501', null, 'estudante não bloqueia ninguém');

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select is(
  public.admin_nav_badges(),
  '{"pendingProposals": 1, "versionsInReview": 1, "openReports": 1}'::jsonb,
  'contadores do menu'
);
select is(
  (select jsonb_agg(item ->> 'kind' order by item ->> 'kind') from jsonb_array_elements(public.admin_attention_queue()) item),
  '["proposal", "report", "version"]'::jsonb,
  'a fila junta proposta, versão em revisão e aviso'
);
select throws_ok(
  $$ select public.admin_set_role('33333333-3333-3333-3333-333333333333', 'teacher') $$,
  'PT409', null, 'ninguém muda o próprio papel'
);
select throws_ok(
  $$ select public.admin_set_course_owner('curso-da-ana', 'bia') $$,
  'PT409', null, 'curso só vai para quem já é professor'
);
select throws_ok($$ select public.admin_end_sessions('33333333-3333-3333-3333-333333333333') $$, 'PT409', null, 'não encerra as próprias sessões por aqui');
select is(jsonb_array_length(public.admin_list_courses(null, 'review')), 1, 'filtra cursos com versão esperando revisão');
select is(jsonb_array_length(public.admin_list_courses('ana', null)), 1, 'busca curso pelo professor');
select is(jsonb_array_length(public.admin_list_courses(null, 'draft')), 1, 'filtra cursos nunca publicados');
select is(
  public.admin_version_impact('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', array['m1-t0']) -> 'completedRemoved',
  '{"m1-t0": 0}'::jsonb,
  'impacto conta quem concluiu cada item, só no curso da versão'
);
select ok(public.admin_check_slug('nome-livre') and not public.admin_check_slug('curso-da-ana'), 'confere se o endereço está livre');

select throws_ok(
  $$ select public.admin_set_course_listed('engenharia-de-ia', false, 'spam', null) $$,
  'PT422', null, 'motivo fora da lista é recusado'
);
select lives_ok(
  $$ select public.admin_set_course_listed('engenharia-de-ia', false, 'outdated', 'Revisando os links') $$,
  'tira do catálogo com motivo e nota'
);

-- Blocking.
select lives_ok($$ select public.admin_set_blocked('22222222-2222-2222-2222-222222222222', true) $$, 'admin bloqueia uma pessoa');
reset role;
select results_eq(
  $$ select p.blocked_at is not null, u.banned_until = 'infinity' from public.profiles p join auth.users u on u.id = p.id
     where p.id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values (true, true) $$,
  'o bloqueio marca o perfil e bane o login'
);
select is((select unlisted_note from public.courses where slug = 'engenharia-de-ia'), 'Revisando os links', 'a nota fica no curso');

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline) values ('Outra', 'R', 'T', 'D', '["Um"]') $$,
  '42501', null, 'pessoa bloqueada não envia proposta'
);
select throws_ok($$ select public.report_profile('ana', 'other', '') $$, '42501', null, 'pessoa bloqueada não envia aviso');
select is((select count(*)::integer from public.course_progress), 1, 'pessoa bloqueada ainda lê os próprios dados');

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select lives_ok($$ select public.admin_resolve_report((public.admin_list_reports() -> 0 ->> 'id')::uuid, 'dismissed') $$, 'admin arquiva o aviso');
select throws_ok(
  $$ select public.admin_delete_account('11111111-1111-1111-1111-111111111111') $$,
  'PT409', null, 'não exclui a conta de quem tem curso'
);
select lives_ok($$ select public.admin_delete_account('22222222-2222-2222-2222-222222222222') $$, 'admin exclui a conta de uma estudante');
select is(
  (select jsonb_agg(item ->> 'action' order by (item ->> 'id')::bigint desc) from jsonb_array_elements(public.admin_list_audit(null, 50, 'people') -> 'items') item),
  '["account.deleted", "report.dismissed", "account.blocked"]'::jsonb,
  'o histórico filtra as ações sobre pessoas, mais novas primeiro'
);

select * from finish();
rollback;

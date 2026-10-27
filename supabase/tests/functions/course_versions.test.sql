-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(30);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated', '{"user_name": "caio"}');

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

insert into public.courses (slug, owner_id, content, published)
values ('curso-teste', '11111111-1111-1111-1111-111111111111', '{"slug": "curso-teste", "title": "Curso"}', false);
insert into public.course_versions (id, course_slug, content, created_by)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'curso-teste', '{"slug": "curso-teste", "title": "Curso"}', '11111111-1111-1111-1111-111111111111');

-- Nobody reads the table directly.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok($$ select * from public.course_versions $$, '42501', null, 'a tabela de versões não abre pela API');

-- Someone else's course does not exist for the caller.
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select public.teacher_get_open_version('curso-teste') $$, 'PT404', null, 'quem não é dono não vê o rascunho');
select throws_ok($$ select public.teacher_open_draft('curso-teste') $$, 'PT404', null, 'quem não é dono não abre rascunho');
select throws_ok(
  $$ select public.teacher_save_draft('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"slug": "curso-teste"}', 1) $$,
  'PT404', null, 'quem não é dono não salva o rascunho'
);
select throws_ok($$ select public.admin_list_versions('curso-teste') $$, '42501', null, 'estudante não lista versões');

-- Teacher: edit and send.
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is(
  public.teacher_get_open_version('curso-teste') -> 'openVersion' ->> 'status',
  'draft',
  'a professora vê o rascunho aberto'
);
select is(
  public.teacher_save_draft('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"slug": "curso-teste", "title": "Curso novo"}', 1),
  2::bigint,
  'salvar avança a revisão'
);
select throws_ok(
  $$ select public.teacher_save_draft('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"slug": "curso-teste"}', 1) $$,
  'PT409', null, 'salvar a partir de uma revisão velha é recusado'
);
select throws_ok(
  $$ select public.teacher_save_draft('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"slug": "outro"}', 2) $$,
  'PT422', null, 'o rascunho não muda de endereço'
);
select is(
  public.teacher_submit_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'minor', 'Primeira versão', 2) ->> 'semver',
  '1.0.0',
  'a primeira publicação é sempre 1.0.0'
);
select throws_ok(
  $$ select public.teacher_save_draft('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"slug": "curso-teste"}', 3) $$,
  'PT409', null, 'em revisão o rascunho fica travado'
);
select is(
  public.teacher_withdraw_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') ->> 'status',
  'draft',
  'retirar da revisão volta para rascunho'
);
select is(
  public.teacher_submit_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'minor', null, 4) ->> 'status',
  'in_review',
  'reenviar coloca de novo na fila'
);
select throws_ok($$ select public.admin_publish_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 5) $$, '42501', null, 'professora não publica');

-- Admin asks for changes.
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok(
  $$ select public.admin_request_version_changes('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '[]', 5) $$,
  'PT422', null, 'pedir ajustes exige pelo menos um ponto'
);
select is(
  public.admin_request_version_changes('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '["Revise a aula 1"]', 5) ->> 'status',
  'changes_requested',
  'admin pede ajustes'
);

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok(
  $$ select public.teacher_submit_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'minor', null, 6) $$,
  'PT409', null, 'não reenvia com ajuste pendente'
);
select is(
  public.teacher_resolve_review_item('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'r1', true) -> 0 ->> 'resolved',
  'true',
  'a professora marca o ajuste como feito'
);
select lives_ok(
  $$ select public.teacher_submit_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'minor', 'Ajustado', 6) $$,
  'com os ajustes feitos, reenvia'
);

-- Admin publishes.
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok(
  $$ select public.admin_publish_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 6) $$,
  'PT409', null, 'publicar exige a revisão conferida'
);
select is(
  public.admin_publish_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Primeira versão', 7) ->> 'status',
  'published',
  'admin publica'
);

reset role;
select results_eq(
  $$ select published, content ->> 'version', content ->> 'title', published_version_id::text from public.courses where slug = 'curso-teste' $$,
  $$ values (true, '1.0.0'::text, 'Curso novo'::text, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::text) $$,
  'o curso passa a mostrar a versão publicada'
);

-- A second version supersedes the first.
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is(
  public.teacher_open_draft('curso-teste') ->> 'basedOnSemver',
  '1.0.0',
  'o novo rascunho parte da versão publicada'
);
select is(
  public.teacher_open_draft('curso-teste') ->> 'revision',
  '1',
  'abrir de novo devolve o mesmo rascunho'
);

reset role;
select is(
  (select count(*)::integer from public.course_versions where course_slug = 'curso-teste' and status = 'draft'),
  1,
  'só existe um rascunho aberto'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is(
  (select public.teacher_submit_version(
    (public.teacher_open_draft('curso-teste') ->> 'id')::uuid, 'minor', null, 1
  ) ->> 'semver'),
  '1.1.0',
  'versão menor sobe o segundo número'
);

set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select lives_ok(
  $$ select public.admin_publish_version(
       ((public.admin_list_versions('curso-teste') -> 0) ->> 'id')::uuid, 'Novo módulo', 2) $$,
  'admin publica a segunda versão'
);
select lives_ok(
  $$ select public.admin_restore_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  'admin restaura a versão antiga como rascunho'
);
select throws_ok(
  $$ select public.admin_restore_version('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  'PT409', null, 'não restaura com outra versão aberta'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is(
  (select jsonb_agg(release ->> 'semver') from jsonb_array_elements(public.public_course_releases('curso-teste')) as release),
  '["1.1.0", "1.0.0"]'::jsonb,
  'a página pública lista as versões publicadas'
);

select * from finish();
rollback;

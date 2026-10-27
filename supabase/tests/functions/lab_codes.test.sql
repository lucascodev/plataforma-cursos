-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}');

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';
update public.courses set owner_id = '11111111-1111-1111-1111-111111111111' where slug = 'engenharia-de-ia';

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select * from public.course_lab_codes $$, '42501', null, 'os códigos esperados não abrem pela API');
select throws_ok($$ select public.teacher_set_lab_code('engenharia-de-ia', 'm2-t1', 'LAB-ABCD1234') $$, 'PT404', null, 'só a dona registra o código');
select throws_ok($$ select public.verify_lab_code('engenharia-de-ia', 'm2-t1', 'LAB-ABCD1234') $$, 'PT409', null, 'laboratório sem código registrado avisa');

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok($$ select public.teacher_set_lab_code('engenharia-de-ia', 'm2-t1', 'codigo') $$, 'PT422', null, 'código fora do formato é recusado');
select lives_ok($$ select public.teacher_set_lab_code('engenharia-de-ia', 'm2-t1', ' lab-abcd1234 ') $$, 'a dona registra o código');
select is(public.teacher_list_lab_codes('engenharia-de-ia'), '{"m2-t1": "LAB-ABCD1234"}'::jsonb, 'o código fica normalizado');

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select is(public.verify_lab_code('engenharia-de-ia', 'm2-t1', 'LAB-00000000'), false, 'código errado não conclui');
select is(public.verify_lab_code('engenharia-de-ia', 'm2-t1', 'lab-abcd 1234'), true, 'código certo conclui, sem diferenciar maiúsculas e espaços');
select is((select count(*)::integer from public.lab_completions), 1, 'a pessoa vê a própria conclusão');

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select public.verify_lab_code('engenharia-de-ia', 'm2-t1', 'LAB-ABCD1234') $$, '42501', null, 'visitante não verifica');

select * from finish();
rollback;

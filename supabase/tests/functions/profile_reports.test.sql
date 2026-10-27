-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}');

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select public.report_profile('ana', 'other', '') $$, '42501', null, 'visitante precisa entrar para avisar');

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select * from public.profile_reports $$, '42501', null, 'os avisos não abrem pela API');
select throws_ok($$ select public.report_profile('ana', 'spam', '') $$, 'PT422', null, 'motivo fora da lista é recusado');
select throws_ok($$ select public.report_profile('bia', 'other', '') $$, 'PT404', null, 'perfil que não é público não recebe aviso');
select lives_ok($$ select public.report_profile('ana', 'suspicious-link', 'Link estranho') $$, 'estudante avisa sobre um perfil');
select lives_ok($$ select public.report_profile('ana', 'other', '') $$, 'avisar de novo não dá erro');

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok($$ select public.report_profile('ana', 'other', '') $$, 'PT422', null, 'ninguém avisa sobre o próprio perfil');

reset role;
select is(
  (select count(*)::integer from public.profile_reports where profile_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'um aviso aberto por pessoa e perfil'
);

select * from finish();
rollback;

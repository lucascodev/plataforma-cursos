-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated',
   '{"user_name": "Ana-Dev", "full_name": "Ana Souza", "avatar_url": "https://avatars.githubusercontent.com/u/11"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated',
   '{"user_name": "ana-dev", "avatar_url": "https://example.com/foto.png"}'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com', 'authenticated', 'authenticated', null);

select results_eq(
  $$ select handle, display_name, avatar_url from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('ana-dev'::text, 'Ana Souza'::text, 'https://avatars.githubusercontent.com/u/11'::text) $$,
  'o cadastro cria o perfil com o login do GitHub'
);
select results_eq(
  $$ select handle like 'ana-dev-%', avatar_url is null from public.profiles where id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values (true, true) $$,
  'login repetido ganha sufixo e avatar fora do GitHub é descartado'
);
select results_eq(
  $$ select handle like 'pessoa-%', display_name, role from public.profiles where id = '33333333-3333-3333-3333-333333333333' $$,
  $$ values (true, 'Pessoa estudante'::text, 'student'::text) $$,
  'sem metadados o perfil também nasce, como estudante'
);

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select results_eq(
  $$ select handle from public.profiles $$,
  $$ values ('ana-dev'::text) $$,
  'visitante só vê perfis de professores'
);
select is(public.is_admin(), false, 'visitante não é admin');

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select results_eq(
  $$ select count(*)::int from public.profiles $$,
  $$ values (2) $$,
  'estudante vê o próprio perfil e o de professores'
);
select lives_ok($$ update public.profiles set bio = 'Estudando IA' where id = '22222222-2222-2222-2222-222222222222' $$, 'estudante edita a própria bio');
select results_eq(
  $$ select bio from public.profiles where id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values ('Estudando IA'::text) $$,
  'a bio foi gravada'
);
select throws_ok($$ update public.profiles set role = 'admin' where id = '22222222-2222-2222-2222-222222222222' $$, '42501', null, 'ninguém muda o próprio papel');
select throws_ok($$ update public.profiles set handle = 'outra' where id = '22222222-2222-2222-2222-222222222222' $$, '42501', null, 'ninguém muda o próprio endereço');
select results_eq(
  $$ with changed as (update public.profiles set bio = 'invadido' where id = '11111111-1111-1111-1111-111111111111' returning 1) select count(*)::int from changed $$,
  $$ values (0) $$,
  'ninguém edita o perfil de outra pessoa'
);
select throws_ok(
  $$ update public.profiles set links = '[1,2,3,4,5,6]' where id = '22222222-2222-2222-2222-222222222222' $$,
  '23514', null, 'no máximo 5 links'
);
select is(public.is_admin(), false, 'estudante não é admin');
select is(public.ensure_profile() ->> 'role', 'student', 'ensure_profile devolve o papel');

reset role;
delete from public.profiles where id = '33333333-3333-3333-3333-333333333333';
set local role authenticated;
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select is(public.ensure_profile() ->> 'role', 'student', 'ensure_profile recria um perfil que faltou');

reset role;
update auth.users set raw_user_meta_data = '{"user_name": "Ana-Dev", "avatar_url": "https://avatars.githubusercontent.com/u/99"}'
where id = '11111111-1111-1111-1111-111111111111';
select results_eq(
  $$ select avatar_url, display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  $$ values ('https://avatars.githubusercontent.com/u/99'::text, 'Ana Souza'::text) $$,
  'avatar acompanha o GitHub e o nome editado fica'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok($$ select public.ensure_profile() $$, '42501', null, 'visitante não chama ensure_profile');

select * from finish();
rollback;

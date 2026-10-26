-- Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email, aud, role)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok(
  $$ insert into public.account_settings (timezone, theme, notify) values ('America/Recife', 'dark', '{"proposalUpdates": true}') $$,
  'Ana grava as próprias preferências'
);
select throws_ok(
  $$ insert into public.account_settings (user_id, theme) values ('22222222-2222-2222-2222-222222222222', 'dark') $$,
  '42501', null, 'Ana não grava preferências de outra pessoa'
);
select throws_ok(
  $$ update public.account_settings set theme = 'neon' $$,
  '23514', null, 'tema precisa ser um dos conhecidos'
);

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select is_empty($$ select 1 from public.account_settings $$, 'Bia não vê as preferências de Ana');

reset role;
set local role anon;
select throws_ok($$ select * from public.account_settings $$, '42501', null, 'visitante não lê preferências');

reset role;
select results_eq(
  $$ select timezone, theme from public.account_settings $$,
  $$ values ('America/Recife'::text, 'dark'::text) $$,
  'a linha ficou com o dono certo'
);

select * from finish();
rollback;

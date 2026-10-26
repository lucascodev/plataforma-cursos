-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated');
update public.profiles set role = 'teacher', handle = 'ana' where id = '11111111-1111-1111-1111-111111111111';

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ update public.profiles set headline = 'Engenheira de IA', short_bio = 'Ensino IA aplicada.'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'a pessoa edita o próprio título e o resumo curto'
);
select throws_ok(
  $$ update public.profiles set headline = repeat('x', 81) where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null, 'título com mais de 80 letras é recusado'
);
select throws_ok(
  $$ update public.profiles set short_bio = repeat('x', 161) where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null, 'resumo com mais de 160 letras é recusado'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is(
  public.public_teacher_profile('ana') ->> 'headline',
  'Engenheira de IA',
  'a página pública mostra o título'
);

select * from finish();
rollback;

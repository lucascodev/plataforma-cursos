-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  public.save_course_progress('engenharia-de-ia', '{"completedItems": {"m1-t0": true}, "futureField": 1}', 0),
  1::bigint,
  'primeiro salvamento cria a linha na revisão 1'
);

select is(
  public.save_course_progress('engenharia-de-ia', '{"completedItems": {"m1-t0": true, "m1-t1": true}}', 1),
  2::bigint,
  'salvar a partir da revisão atual avança a revisão'
);

reset role;
select is(
  (select data -> 'futureField' from public.course_progress where course_slug = 'engenharia-de-ia'),
  '1'::jsonb,
  'campo que o cliente não mandou continua salvo'
);
select is(
  (select data -> 'completedItems' from public.course_progress where course_slug = 'engenharia-de-ia'),
  '{"m1-t0": true, "m1-t1": true}'::jsonb,
  'campo enviado substitui o anterior'
);
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select throws_ok(
  $$ select public.save_course_progress('engenharia-de-ia', '{"completedItems": {}}', 1) $$,
  'PT409', null, 'salvar a partir de uma revisão velha é recusado'
);

select is(
  public.save_course_progress('engenharia-de-ia', '{"journal": {}}'),
  3::bigint,
  'sem revisão (aba com código antigo) salva sem conferir'
);

select throws_ok(
  $$ select public.save_course_progress('nao-existe', '{}', 0) $$,
  '42501', null, 'curso que não está publicado é recusado pelo RLS'
);

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select throws_ok(
  $$ select public.save_course_progress('engenharia-de-ia', '{}', 0) $$,
  '42501', null, 'visitante não chama a função'
);

select * from finish();
rollback;

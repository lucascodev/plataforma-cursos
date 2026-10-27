-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline, level, duration, commitments_accepted_at)
     values ('Curso novo', 'Resumo', 'Todos', 'Dados', '["Um"]', 'beginner', '3-to-6-months', '2000-01-01') $$,
  'a proposta leva nível, duração e o aceite dos compromissos'
);
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline, level)
     values ('Outro curso', 'Resumo', 'Todos', 'Dados', '["Um"]', 'expert') $$,
  '23514', null, 'nível fora da lista é recusado'
);

reset role;
select ok(
  (select commitments_accepted_at > now() - interval '1 minute' from public.course_proposals where title = 'Curso novo'),
  'a hora do aceite é a do banco, não a enviada'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select throws_ok(
  $$ update public.course_proposals set commitments_accepted_at = null where title = 'Curso novo' $$,
  '42501', null, 'o aceite não é apagado depois'
);
select lives_ok(
  $$ update public.profiles set links = '[{"label": "Site", "url": "https://ana.dev", "kind": "site"}]'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'link com tipo é aceito'
);
select throws_ok(
  $$ update public.profiles set links = '[{"label": "X", "url": "https://x.com", "kind": "twitter"}]'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null, 'tipo de link fora da lista é recusado'
);

select * from finish();
rollback;

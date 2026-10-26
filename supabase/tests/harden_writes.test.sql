-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

-- The seed course is removed inside this transaction so the test only reads the rows it creates.
delete from public.courses where slug = 'engenharia-de-ia';

insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated');

insert into public.courses (slug, content, published, listed)
values
  ('publicado', '{"slug": "publicado", "title": "Publicado"}', true, true),
  ('rascunho', '{"slug": "rascunho", "title": "Rascunho"}', false, true);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('abc' || repeat(' ', 500), 'Resumo', 'Todos', 'Dados', '["M1"]') $$,
  '23514', null, 'espaços no fim contam no limite do título'
);
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Curso longo', 'Resumo', 'Todos', 'Dados', jsonb_build_array(repeat('x', 121))) $$,
  '23514', null, 'cada módulo do esboço tem no máximo 120 letras'
);
select throws_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Curso vazio', 'Resumo', 'Todos', 'Dados', '["   "]') $$,
  '23514', null, 'módulo do esboço não pode ser só espaço'
);
select lives_ok(
  $$ insert into public.course_proposals (title, summary, audience, area, outline)
     values ('Curso certo', 'Resumo', 'Todos', 'Dados', '["M1", "M2"]') $$,
  'proposta dentro dos limites passa'
);

select throws_ok(
  $$ update public.profiles set links = '[{"label": "Site", "url": "javascript:alert(1)"}]'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null, 'link do perfil precisa ser https'
);
select lives_ok(
  $$ update public.profiles set links = '[{"label": "Site", "url": "https://ana.dev"}]'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'link https é aceito'
);

select lives_ok(
  $$ insert into public.course_progress (course_slug, data) values ('publicado', '{}') $$,
  'salva progresso de curso publicado'
);
select throws_ok(
  $$ insert into public.course_progress (course_slug, data) values ('rascunho', '{}') $$,
  '42501', null, 'não salva progresso de curso não publicado'
);

reset role;
insert into public.rate_limits (bucket, subject, window_start, hits)
values ('settings-write', '11111111-1111-1111-1111-111111111111', pg_catalog.date_bin(interval '1 hour', now(), timestamptz '2000-01-01'), 60);
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select throws_ok(
  $$ insert into public.account_settings (user_id) values ('11111111-1111-1111-1111-111111111111') $$,
  'PT429', null, 'passou do limite de escrita na janela'
);
select throws_ok(
  $$ select * from public.rate_limits $$,
  '42501', null, 'os contadores não aparecem na API'
);

select * from finish();
rollback;

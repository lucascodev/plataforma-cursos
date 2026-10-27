-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email, aud, role, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com', 'authenticated', 'authenticated', '{"user_name": "ana"}'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com', 'authenticated', 'authenticated', '{"user_name": "bia"}');

-- Six students: five stopped in m1, one reached the capstone m2 and delivered it.
insert into auth.users (id, email, aud, role, raw_user_meta_data)
select ('00000000-0000-0000-0000-00000000000' || n)::uuid, 'aluno' || n || '@example.com', 'authenticated', 'authenticated',
  jsonb_build_object('user_name', 'aluno' || n)
from generate_series(1, 6) as n;

update public.profiles set role = 'teacher' where id = '11111111-1111-1111-1111-111111111111';

insert into public.courses (slug, owner_id, content, published)
values (
  'curso-numeros',
  '11111111-1111-1111-1111-111111111111',
  '{"slug": "curso-numeros", "title": "Números", "modules": [
     {"id": "m1", "shortTitle": "Base", "kind": "standard"},
     {"id": "m-final", "shortTitle": "Final", "kind": "capstone"}
   ]}',
  true
);

insert into public.course_progress (user_id, course_slug, data)
select ('00000000-0000-0000-0000-00000000000' || n)::uuid, 'curso-numeros',
  case when n = 6
    then '{"completedItems": {"m1-t0": true, "m-final-t0": true}, "projectDeliveries": {"m-final": {"repoUrl": "https://github.com/x/y"}}}'::jsonb
    else '{"completedItems": {"m1-t0": true}}'::jsonb
  end
from generate_series(1, 6) as n;

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$ select public.teacher_course_stats('curso-numeros') $$, 'PT404', null, 'só a dona vê os números');
select is(public.teacher_list_my_courses(), '[]'::jsonb, 'quem não tem curso recebe uma lista vazia');

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is((public.teacher_course_stats('curso-numeros') ->> 'students')::integer, 6, 'conta quem estuda');
select is(public.teacher_course_stats('curso-numeros') -> 'completed', 'null'::jsonb, 'menos de 5 concluintes vira null');
select is(public.teacher_course_stats('curso-numeros') -> 'projectsDelivered', 'null'::jsonb, 'menos de 5 entregas vira null');
select is(
  public.teacher_course_stats('curso-numeros') -> 'modules',
  '[{"moduleId": "m1", "shortTitle": "Base", "people": 5}, {"moduleId": "m-final", "shortTitle": "Final", "people": null}]'::jsonb,
  'mostra onde as pessoas estão, escondendo grupos pequenos (o id do módulo pode ter hífen)'
);
select is(
  (public.teacher_list_my_courses() -> 0 ->> 'studentCount')::integer,
  6,
  'a lista de cursos traz o número de estudantes'
);

reset role;
delete from public.course_progress where user_id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is(public.teacher_course_stats('curso-numeros') -> 'modules', '[]'::jsonb, 'com menos de 5 pessoas, não mostra módulos');
select is(public.teacher_list_my_courses() -> 0 -> 'studentCount', 'null'::jsonb, 'menos de 5 estudantes vira null');

select * from finish();
rollback;

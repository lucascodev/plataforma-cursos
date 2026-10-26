-- Run with: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select is(
  private.course_content_with_item_ids('{"modules": [{"id": "m1", "lessons": [{"title": "A"}, {"title": "B"}], "drills": [{"title": "D"}]}]}'),
  '{"modules": [{"id": "m1", "lessons": [{"id": "t0", "title": "A"}, {"id": "t1", "title": "B"}], "drills": [{"id": "e0", "title": "D"}]}]}'::jsonb,
  'preenche os ids pela posição, as mesmas chaves que o progresso já usa'
);

select is(
  private.course_content_with_item_ids('{"modules": [{"id": "m1", "lessons": [{"id": "tabc", "title": "A"}, {"title": "B"}], "drills": []}]}'),
  '{"modules": [{"id": "m1", "lessons": [{"id": "tabc", "title": "A"}, {"id": "t1", "title": "B"}], "drills": []}]}'::jsonb,
  'mantém os ids que já existem'
);

select is(
  private.course_content_with_item_ids(private.course_content_with_item_ids('{"modules": [{"id": "m1", "lessons": [{"title": "A"}], "drills": []}]}')),
  private.course_content_with_item_ids('{"modules": [{"id": "m1", "lessons": [{"title": "A"}], "drills": []}]}'),
  'rodar de novo não muda nada'
);

select is(
  private.course_content_with_item_ids('{"slug": "rascunho", "title": "Rascunho"}'),
  '{"slug": "rascunho", "title": "Rascunho"}'::jsonb,
  'rascunho sem módulos fica como está'
);

select ok(
  not exists (
    select 1
    from public.courses course,
      jsonb_array_elements(course.content -> 'modules') as module,
      jsonb_array_elements(module -> 'lessons') as lesson
    where not lesson ? 'id'
  ),
  'nenhuma aula do banco ficou sem id'
);

select * from finish();
rollback;

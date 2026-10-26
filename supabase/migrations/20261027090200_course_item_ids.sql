-- Lessons and drills get stable ids, so reordering or removing one no longer moves people's progress to another item.
-- Missing ids are filled by position (t0, t1… and e0, e1…), the same keys progress already uses: no progress row changes.
-- Same rule as contracts/course/item-ids/default-lesson-id.ts and default-drill-id.ts.

create or replace function private.with_item_ids(p_items jsonb, p_prefix text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      case
        when jsonb_typeof(item) = 'object' and not item ? 'id' then jsonb_build_object('id', p_prefix || (position - 1)) || item
        else item
      end
      order by position
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(p_items) with ordinality as items(item, position);
$$;

create or replace function private.course_content_with_item_ids(p_content jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(jsonb_typeof(p_content -> 'modules'), '') <> 'array' then p_content
    else jsonb_set(p_content, '{modules}', (
      select coalesce(
        jsonb_agg(
          case
            when jsonb_typeof(module) <> 'object' then module
            else module
              || case when jsonb_typeof(module -> 'lessons') = 'array'
                   then jsonb_build_object('lessons', private.with_item_ids(module -> 'lessons', 't')) else '{}'::jsonb end
              || case when jsonb_typeof(module -> 'drills') = 'array'
                   then jsonb_build_object('drills', private.with_item_ids(module -> 'drills', 'e')) else '{}'::jsonb end
          end
          order by position
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(p_content -> 'modules') with ordinality as modules(module, position)
    ))
  end;
$$;

revoke execute on function private.with_item_ids(jsonb, text) from public, anon, authenticated;
revoke execute on function private.course_content_with_item_ids(jsonb) from public, anon, authenticated;

update public.courses
set content = private.course_content_with_item_ids(content)
where content is distinct from private.course_content_with_item_ids(content);

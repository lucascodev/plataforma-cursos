-- What a teacher sees about their own courses. Only counts leave course_progress, never a row, a name or a note, and any
-- count below 5 comes back as null ("menos de 5") so a small course cannot be used to find out what one person did.

create or replace function private.suppress_small_count(p_count bigint)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_count >= 5 then p_count::integer end;
$$;

-- Module of a completed item key ("<moduleId>-t3", "<moduleId>-e0", "<moduleId>-cp"). Module ids may contain hyphens,
-- item ids never do.
create or replace function private.progress_key_module(p_key text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.regexp_replace(p_key, '-(t[a-z0-9]{1,12}|e[a-z0-9]{1,12}|cp)$', '');
$$;

revoke execute on function private.suppress_small_count(bigint) from public, anon, authenticated;
revoke execute on function private.progress_key_module(text) from public, anon, authenticated;

create or replace function public.teacher_list_my_courses()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'slug', c.slug,
      'title', coalesce(nullif(btrim(open_version.content ->> 'title'), ''), c.title, c.slug),
      'published', c.published,
      'listed', c.listed,
      'publishedVersion', case when published_version.id is not null
        then private.course_version_json(published_version, false) end,
      'openVersion', case when open_version.id is not null
        then private.course_version_json(open_version, false) end,
      'studentCount', private.suppress_small_count(
        (select count(*) from public.course_progress cp where cp.course_slug = c.slug)
      ),
      'updatedAt', greatest(c.updated_at, open_version.updated_at)
    ) order by greatest(c.updated_at, open_version.updated_at) desc), '[]'::jsonb)
    from public.courses c
    left join public.course_versions published_version on published_version.id = c.published_version_id
    left join public.course_versions open_version
      on open_version.course_slug = c.slug and open_version.status in ('draft', 'in_review', 'changes_requested')
    where c.owner_id = v_uid
  );
end;
$$;

-- Numbers for one course: the owner and the admins may read them.
create or replace function public.teacher_course_stats(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
  v_students bigint;
  v_capstones text[];
  v_modules jsonb;
begin
  select * into v_course from public.courses where slug = p_slug;
  if not found or (v_course.owner_id is distinct from (select auth.uid()) and not public.is_admin()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;

  select count(*) into v_students from public.course_progress where course_slug = p_slug;

  select coalesce(array_agg(module ->> 'id'), '{}')
  into v_capstones
  from jsonb_array_elements(coalesce(v_course.content -> 'modules', '[]'::jsonb)) as module
  where module ->> 'kind' = 'capstone';

  -- Where people are: the furthest module in which each person completed something. Shares only above the threshold.
  with furthest as (
    select cp.user_id, max(module.position) as position
    from public.course_progress cp
    cross join lateral jsonb_object_keys(
      case when jsonb_typeof(cp.data -> 'completedItems') = 'object' then cp.data -> 'completedItems' else '{}'::jsonb end
    ) as item(key)
    join jsonb_array_elements(coalesce(v_course.content -> 'modules', '[]'::jsonb)) with ordinality as module(value, position)
      on module.value ->> 'id' = private.progress_key_module(item.key)
    where cp.course_slug = p_slug
    group by cp.user_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'moduleId', module.value ->> 'id',
    'shortTitle', coalesce(module.value ->> 'shortTitle', module.value ->> 'id'),
    'people', private.suppress_small_count((select count(*) from furthest f where f.position = module.position))
  ) order by module.position), '[]'::jsonb)
  into v_modules
  from jsonb_array_elements(coalesce(v_course.content -> 'modules', '[]'::jsonb)) with ordinality as module(value, position);

  return jsonb_build_object(
    'students', private.suppress_small_count(v_students),
    'active7d', private.suppress_small_count(
      (select count(*) from public.course_progress where course_slug = p_slug and updated_at > now() - interval '7 days')
    ),
    'projectsDelivered', private.suppress_small_count((
      select count(*)
      from public.course_progress cp
      cross join lateral jsonb_object_keys(
        case when jsonb_typeof(cp.data -> 'projectDeliveries') = 'object' then cp.data -> 'projectDeliveries' else '{}'::jsonb end
      ) as delivery(module_id)
      where cp.course_slug = p_slug
    )),
    'completed', private.suppress_small_count((
      select count(*)
      from public.course_progress cp
      where cp.course_slug = p_slug
        and cardinality(v_capstones) > 0
        and jsonb_typeof(cp.data -> 'projectDeliveries') = 'object'
        and (cp.data -> 'projectDeliveries') ?| v_capstones
    )),
    'modules', case when v_students >= 5 then v_modules else '[]'::jsonb end
  );
end;
$$;

revoke execute on function public.teacher_list_my_courses() from public, anon, authenticated;
revoke execute on function public.teacher_course_stats(text) from public, anon, authenticated;
grant execute on function public.teacher_list_my_courses() to authenticated;
grant execute on function public.teacher_course_stats(text) to authenticated;

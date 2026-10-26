-- Saving progress used to replace the whole document. A tab running older code drops fields it does not know, and two tabs
-- overwrite each other. save_course_progress merges the top-level fields it receives into the stored document and, when the
-- caller sends the revision it started from, refuses the save if someone else saved in between.

alter table public.course_progress add column if not exists revision bigint not null default 0;

create or replace function public.save_course_progress(p_slug text, p_data jsonb, p_base_revision bigint default null)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_revision bigint;
begin
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception using errcode = 'PT422', message = 'invalid progress', hint = 'invalid-progress';
  end if;

  update public.course_progress
  set data = data || p_data, revision = revision + 1
  where user_id = v_user and course_slug = p_slug and (p_base_revision is null or revision = p_base_revision)
  returning revision into v_revision;
  if found then
    return v_revision;
  end if;

  if exists (select 1 from public.course_progress where user_id = v_user and course_slug = p_slug) then
    raise exception using errcode = 'PT409', message = 'progress changed', hint = 'progress-conflict';
  end if;

  insert into public.course_progress (user_id, course_slug, data, revision)
  values (v_user, p_slug, p_data, 1)
  on conflict (user_id, course_slug) do nothing
  returning revision into v_revision;
  if v_revision is null then
    raise exception using errcode = 'PT409', message = 'progress changed', hint = 'progress-conflict';
  end if;
  return v_revision;
end;
$$;

revoke execute on function public.save_course_progress(text, jsonb, bigint) from public, anon;
grant execute on function public.save_course_progress(text, jsonb, bigint) to authenticated;

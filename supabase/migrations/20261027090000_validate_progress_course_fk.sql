-- Replaces the manual "validate constraint" step from the setup guide.
-- Validates only when every progress row already points to an existing course; otherwise it changes nothing and says why,
-- so a database with orphan rows keeps working and no one's progress is deleted.

do $$
declare
  is_validated boolean;
  orphan_count bigint;
begin
  select convalidated into is_validated
  from pg_catalog.pg_constraint
  where conname = 'course_progress_course_fk'
    and conrelid = 'public.course_progress'::regclass;

  if is_validated is null or is_validated then
    return;
  end if;

  select count(*) into orphan_count
  from public.course_progress progress
  where not exists (select 1 from public.courses course where course.slug = progress.course_slug);

  if orphan_count > 0 then
    raise notice 'course_progress_course_fk not validated: % progress rows point to missing courses.', orphan_count;
    return;
  end if;

  alter table public.course_progress validate constraint course_progress_course_fk;
end;
$$;

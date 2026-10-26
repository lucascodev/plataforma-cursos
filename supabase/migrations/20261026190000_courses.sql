-- Course content lives in the database. Anyone may read published courses; only admins may write.
-- Admin = app_metadata.role 'admin'. app_metadata can only be changed with the secret key, never by the user.

create table if not exists public.courses (
  slug text primary key,
  content jsonb not null,
  published boolean not null default false,
  title text generated always as (content ->> 'title') stored,
  version text generated always as (content ->> 'version') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_slug_format check (slug ~ '^[a-z0-9-]{1,60}$'),
  constraint courses_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint courses_content_matches_slug check (content ->> 'slug' = slug),
  constraint courses_content_size check (octet_length(content::text) <= 1000000)
);

comment on table public.courses is 'Conteúdo dos cursos (documento validado pelo schema do repositório). Leitura pública dos publicados; escrita só por admin.';

alter table public.courses enable row level security;
alter table public.courses force row level security;

revoke all on table public.courses from anon, authenticated, public;
grant select on table public.courses to anon, authenticated;
grant insert, update, delete on table public.courses to authenticated;

create policy "courses_select_published" on public.courses
  for select to anon, authenticated
  using (published or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "courses_insert_admin" on public.courses
  for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "courses_update_admin" on public.courses
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "courses_delete_admin" on public.courses
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.courses_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger courses_touch_updated_at
  before update on public.courses
  for each row execute function public.courses_touch_updated_at();

revoke execute on function public.courses_touch_updated_at() from anon, authenticated, public;

-- Progress now must point to a real course. Deleting a course with progress is refused instead of wiping people's data.
-- NOT VALID keeps existing rows; run "alter table public.course_progress validate constraint course_progress_course_fk;" after importing the courses.
alter table public.course_progress
  add constraint course_progress_course_fk
  foreign key (course_slug) references public.courses (slug)
  on update cascade on delete restrict
  not valid;

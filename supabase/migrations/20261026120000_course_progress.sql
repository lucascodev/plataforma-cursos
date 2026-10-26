-- Progress of each person in each course. One row per (user, course).
-- Security model: the browser only holds the publishable key, so every rule that matters lives here (RLS, checks, limits).

create table if not exists public.course_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_slug text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug),
  constraint course_progress_slug_format check (course_slug ~ '^[a-z0-9-]{1,60}$'),
  constraint course_progress_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint course_progress_data_size check (octet_length(data::text) <= 2000000)
);

comment on table public.course_progress is 'Progresso de cada pessoa em cada curso. Acesso restrito ao dono da linha por RLS.';

alter table public.course_progress enable row level security;
alter table public.course_progress force row level security;

-- Supabase grants table access to anon by default. Visitors without login never touch this table.
revoke all on table public.course_progress from anon, public;
grant select, insert, update, delete on table public.course_progress to authenticated;

-- (select auth.uid()) is evaluated once per statement instead of once per row.
create policy "course_progress_select_own" on public.course_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "course_progress_insert_own" on public.course_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "course_progress_update_own" on public.course_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "course_progress_delete_own" on public.course_progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- The server clock decides updated_at, so a client cannot backdate or future-date its writes.
create or replace function public.course_progress_touch_updated_at()
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

create trigger course_progress_touch_updated_at
  before insert or update on public.course_progress
  for each row execute function public.course_progress_touch_updated_at();

-- Caps rows per person so a single account cannot fill the database with made-up course slugs.
create or replace function public.course_progress_limit_rows()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select count(*) from public.course_progress where user_id = new.user_id) >= 50 then
    raise exception 'Limite de cursos por conta atingido' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger course_progress_limit_rows
  before insert on public.course_progress
  for each row execute function public.course_progress_limit_rows();

revoke execute on function public.course_progress_touch_updated_at() from anon, authenticated, public;
revoke execute on function public.course_progress_limit_rows() from anon, authenticated, public;

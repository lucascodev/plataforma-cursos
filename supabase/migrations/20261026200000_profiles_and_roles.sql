-- Profiles hold the public identity of each person and their role. The role here is the only source of truth for
-- permissions: JWT app_metadata goes stale for up to an hour after a change and cannot be written with the publishable key.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student',
  handle text not null,
  display_name text not null,
  avatar_url text,
  bio text not null default '',
  links jsonb not null default '[]'::jsonb,
  show_student_count boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('student', 'teacher', 'admin')),
  constraint profiles_handle_format check (handle ~ '^[a-z0-9][a-z0-9-]{0,38}$'),
  constraint profiles_handle_unique unique (handle),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_avatar_trusted check (
    avatar_url is null or (avatar_url like 'https://avatars.githubusercontent.com/%' and char_length(avatar_url) <= 300)
  ),
  constraint profiles_bio_length check (char_length(bio) <= 1000),
  constraint profiles_links_shape check (
    jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 5 and octet_length(links::text) <= 4000
  )
);

comment on table public.profiles is 'Identidade pública e papel de cada pessoa. O papel só muda por funções de admin.';

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create index if not exists profiles_role_idx on public.profiles (role);

-- Helpers used by policies. security definer so a policy on profiles never recurses into itself.
create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.role = 'admin' from public.profiles p where p.id = (select auth.uid())), false);
$$;

revoke execute on function public.app_role() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.app_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Only the person edits their own profile, and only these columns. Role and handle change through admin functions.
revoke all on table public.profiles from anon, authenticated, public;
grant select on table public.profiles to anon, authenticated;
grant update (display_name, bio, links, show_student_count) on table public.profiles to authenticated;

-- Public profiles: teachers and anyone who owns a published course (the course check is added with course ownership).
create policy "profiles_select_self_or_admin" on public.profiles
  for select to anon, authenticated
  using (id = (select auth.uid()) or role = 'teacher' or (select public.is_admin()));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.profiles_touch_updated_at()
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

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.profiles_touch_updated_at();

-- Turns a GitHub login into a free handle. GitHub logins are already [a-z0-9-], case-insensitive, up to 39 characters.
create or replace function public.pick_profile_handle(p_login text, p_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_base text := left(trim(both '-' from regexp_replace(lower(coalesce(p_login, '')), '[^a-z0-9-]+', '-', 'g')), 39);
  v_compact_id text := replace(p_id::text, '-', '');
begin
  if v_base = '' then
    return 'pessoa-' || left(v_compact_id, 8);
  end if;
  if not exists (select 1 from public.profiles p where p.handle = v_base and p.id <> p_id) then
    return v_base;
  end if;
  return left(v_base, 32) || '-' || left(v_compact_id, 6);
end;
$$;

create or replace function public.create_profile_from_auth(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb;
  v_login text;
  v_name text;
  v_avatar text;
begin
  select coalesce(u.raw_user_meta_data, '{}'::jsonb) into v_meta from auth.users u where u.id = p_id;
  if not found then
    return;
  end if;
  v_login := coalesce(v_meta ->> 'user_name', v_meta ->> 'preferred_username', '');
  v_name := left(coalesce(
    nullif(btrim(v_meta ->> 'full_name'), ''),
    nullif(btrim(v_meta ->> 'name'), ''),
    nullif(btrim(v_login), ''),
    'Pessoa estudante'
  ), 80);
  v_avatar := v_meta ->> 'avatar_url';
  if v_avatar is not null and (v_avatar not like 'https://avatars.githubusercontent.com/%' or char_length(v_avatar) > 300) then
    v_avatar := null;
  end if;

  begin
    insert into public.profiles (id, handle, display_name, avatar_url)
    values (p_id, public.pick_profile_handle(v_login, p_id), v_name, v_avatar)
    on conflict (id) do nothing;
  exception when unique_violation then
    insert into public.profiles (id, handle, display_name, avatar_url)
    values (p_id, 'pessoa-' || left(replace(p_id::text, '-', ''), 12), v_name, v_avatar)
    on conflict (id) do nothing;
  end;
end;
$$;

-- A failure here must never block sign-up, so errors become warnings. ensure_profile() fills any gap on the next visit.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.create_profile_from_auth(new.id);
  return new;
exception when others then
  raise warning 'profile creation failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keeps the GitHub avatar fresh. The name stays as the person edited it.
create or replace function public.sync_profile_avatar()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_avatar text := new.raw_user_meta_data ->> 'avatar_url';
begin
  if v_avatar is distinct from (old.raw_user_meta_data ->> 'avatar_url') then
    if v_avatar is not null and (v_avatar not like 'https://avatars.githubusercontent.com/%' or char_length(v_avatar) > 300) then
      v_avatar := null;
    end if;
    update public.profiles set avatar_url = v_avatar where id = new.id;
  end if;
  return new;
exception when others then
  raise warning 'avatar sync failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

create trigger on_auth_user_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_avatar();

-- Called by GET /api/me: returns the caller's role and identity, creating the profile if it is missing.
create or replace function public.ensure_profile()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  select * into v_row from public.profiles where id = v_uid;
  if not found then
    perform public.create_profile_from_auth(v_uid);
    select * into v_row from public.profiles where id = v_uid;
  end if;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'profile-not-found';
  end if;
  return jsonb_build_object(
    'id', v_row.id,
    'role', v_row.role,
    'handle', v_row.handle,
    'displayName', v_row.display_name,
    'avatarUrl', v_row.avatar_url
  );
end;
$$;

revoke execute on function public.profiles_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.pick_profile_handle(text, uuid) from public, anon, authenticated;
revoke execute on function public.create_profile_from_auth(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_profile_avatar() from public, anon, authenticated;
revoke execute on function public.ensure_profile() from public, anon, authenticated;
grant execute on function public.ensure_profile() to authenticated;

-- Everyone who signed in before this migration gets a profile. Admins defined the old way (app_metadata) keep admin.
do $$
declare
  v_user record;
begin
  for v_user in select u.id from auth.users u order by u.created_at loop
    perform public.create_profile_from_auth(v_user.id);
  end loop;
end;
$$;

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id and (u.raw_app_meta_data ->> 'role') = 'admin';

-- Personal settings. Only the person reads or writes them.
create table if not exists public.account_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  timezone text not null default 'America/Sao_Paulo',
  theme text not null default 'system',
  notify jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint account_settings_timezone_format check (timezone ~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$' and char_length(timezone) <= 64),
  constraint account_settings_theme_valid check (theme in ('system', 'light', 'dark')),
  constraint account_settings_notify_shape check (jsonb_typeof(notify) = 'object' and octet_length(notify::text) <= 4000)
);

comment on table public.account_settings is 'Preferências da conta (fuso, tema, avisos). Acesso só do dono.';

alter table public.account_settings enable row level security;
alter table public.account_settings force row level security;

revoke all on table public.account_settings from anon, authenticated, public;
grant select, insert, update on table public.account_settings to authenticated;

create policy "account_settings_select_own" on public.account_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "account_settings_insert_own" on public.account_settings
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "account_settings_update_own" on public.account_settings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.account_settings_touch_updated_at()
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

create trigger account_settings_touch_updated_at
  before insert or update on public.account_settings
  for each row execute function public.account_settings_touch_updated_at();

revoke execute on function public.account_settings_touch_updated_at() from public, anon, authenticated;

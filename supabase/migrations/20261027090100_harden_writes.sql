-- Hardening found in the security review:
-- 1. Database checks match the API schemas, so a row written straight through PostgREST can never break a page for others.
-- 2. Row limits take a per-person lock, so parallel requests cannot pass them.
-- 3. Writes are rate limited per person.
-- 4. Progress can only be saved for published courses (the FK alone ignores RLS and revealed draft slugs).
-- 5. Two admins approving with the same slug get "slug-taken" instead of a generic error.

-- 1. Checks aligned with contracts/proposal-input.schema.ts and contracts/profile-link.schema.ts.
-- Check constraints run as the person writing, so the helpers need EXECUTE for authenticated. They live in a schema
-- the Data API does not expose, so they never become RPC endpoints.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_text_list_within(p_list jsonb, p_max_length integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not exists (
    select 1 from jsonb_array_elements_text(p_list) as item
    where char_length(item) > p_max_length or btrim(item) = ''
  );
$$;

create or replace function private.are_profile_links_valid(p_links jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not exists (
    select 1 from jsonb_array_elements(p_links) as link
    where jsonb_typeof(link) <> 'object'
      or jsonb_typeof(link -> 'label') <> 'string'
      or jsonb_typeof(link -> 'url') <> 'string'
      or char_length(link ->> 'label') not between 1 and 40
      or btrim(link ->> 'label') = ''
      or link ->> 'url' not like 'https://%'
      or char_length(link ->> 'url') > 300
  );
$$;

revoke execute on function private.is_text_list_within(jsonb, integer) from public, anon;
revoke execute on function private.are_profile_links_valid(jsonb) from public, anon;
grant execute on function private.is_text_list_within(jsonb, integer) to authenticated;
grant execute on function private.are_profile_links_valid(jsonb) to authenticated;

alter table public.course_proposals
  drop constraint course_proposals_title_length,
  drop constraint course_proposals_summary_length,
  drop constraint course_proposals_audience_length,
  drop constraint course_proposals_area_length,
  drop constraint course_proposals_outline_shape,
  add constraint course_proposals_title_length check (char_length(btrim(title)) >= 3 and char_length(title) <= 120),
  add constraint course_proposals_summary_length check (btrim(summary) <> '' and char_length(summary) <= 2000),
  add constraint course_proposals_audience_length check (btrim(audience) <> '' and char_length(audience) <= 400),
  add constraint course_proposals_area_length check (btrim(area) <> '' and char_length(area) <= 60),
  add constraint course_proposals_outline_shape check (
    jsonb_typeof(outline) = 'array'
    and jsonb_array_length(outline) between 1 and 30
    and not jsonb_path_exists(outline, '$[*] ? (@.type() != "string")')
    and private.is_text_list_within(outline, 120)
  );

alter table public.profiles
  drop constraint profiles_links_shape,
  add constraint profiles_links_shape check (
    jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 5 and private.are_profile_links_valid(links)
  );

-- 2. Row limits under a per-person lock. Without it, parallel inserts all count the same rows and all pass.

create or replace function public.course_proposals_limit_rows()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('course_proposals:' || new.author_id::text, 0));
  if (select count(*) from public.course_proposals p
      where p.author_id = new.author_id and p.status in ('pending', 'changes_requested')) >= 3 then
    raise exception using errcode = 'PT409', message = 'too many open proposals', hint = 'too-many-open-proposals';
  end if;
  if (select count(*) from public.course_proposals p where p.author_id = new.author_id) >= 20 then
    raise exception using errcode = 'PT409', message = 'too many proposals', hint = 'too-many-proposals';
  end if;
  return new;
end;
$$;

create or replace function public.course_progress_limit_rows()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('course_progress:' || new.user_id::text, 0));
  if (select count(*) from public.course_progress where user_id = new.user_id) >= 50 then
    raise exception 'Limite de cursos por conta atingido' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- 3. Fixed-window rate limit per person and action. Only the functions below touch the table.

create table if not exists public.rate_limits (
  bucket text not null,
  subject uuid not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, subject, window_start)
);

comment on table public.rate_limits is 'Contadores de limite de escrita por pessoa. Sem acesso pela API.';

alter table public.rate_limits enable row level security;
alter table public.rate_limits force row level security;
revoke all on table public.rate_limits from public, anon, authenticated;

create or replace function public.consume_rate_limit(p_bucket text, p_max integer, p_window interval)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subject uuid := auth.uid();
  v_window timestamptz := pg_catalog.date_bin(p_window, now(), timestamptz '2000-01-01');
  v_hits integer;
begin
  if v_subject is null then
    return;
  end if;
  insert into public.rate_limits as limits (bucket, subject, window_start, hits)
  values (p_bucket, v_subject, v_window, 1)
  on conflict (bucket, subject, window_start) do update set hits = limits.hits + 1
  returning hits into v_hits;

  if v_hits > p_max then
    raise exception using errcode = 'PT429', message = 'rate limited', hint = 'rate-limited';
  end if;

  -- Old windows are dropped now and then by the writes themselves; no scheduled job needed.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, interval) from public, anon, authenticated;

create or replace function public.rate_limit_writes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Arguments: bucket, max writes, window. Set per table in the trigger definition.
  perform public.consume_rate_limit(tg_argv[0], tg_argv[1]::integer, tg_argv[2]::interval);
  return new;
end;
$$;

revoke execute on function public.rate_limit_writes() from public, anon, authenticated;

-- Autosave sends progress every few seconds while someone studies; 300 writes in 10 minutes leaves room for that.
create trigger course_progress_rate_limit
  before insert or update on public.course_progress
  for each row execute function public.rate_limit_writes('progress-write', '300', '10 minutes');

create trigger course_proposals_rate_limit
  before insert or update on public.course_proposals
  for each row execute function public.rate_limit_writes('proposal-write', '30', '1 hour');

create trigger profiles_rate_limit
  before update on public.profiles
  for each row execute function public.rate_limit_writes('profile-write', '60', '1 hour');

create trigger account_settings_rate_limit
  before insert or update on public.account_settings
  for each row execute function public.rate_limit_writes('settings-write', '60', '1 hour');

-- 4. Progress only for published courses.

drop policy "course_progress_insert_own" on public.course_progress;
drop policy "course_progress_update_own" on public.course_progress;

create policy "course_progress_insert_own" on public.course_progress
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.courses course where course.slug = course_slug and course.published)
  );

create policy "course_progress_update_own" on public.course_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.courses course where course.slug = course_slug and course.published)
  );

-- 5. approve_proposal: the existence check and the insert can race with another approval.

create or replace function public.approve_proposal(p_id uuid, p_slug text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
  v_role text;
begin
  perform public.assert_admin();
  if p_slug is null or p_slug !~ '^[a-z0-9-]{1,60}$' then
    raise exception using errcode = 'PT422', message = 'invalid slug', hint = 'invalid-slug';
  end if;
  select * into v_proposal from public.course_proposals where id = p_id for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'proposal-not-found';
  end if;
  if v_proposal.status <> 'pending' then
    raise exception using errcode = 'PT409', message = 'proposal is not pending', hint = 'proposal-not-pending';
  end if;
  if exists (select 1 from public.courses c where c.slug = p_slug) then
    raise exception using errcode = 'PT409', message = 'slug taken', hint = 'slug-taken';
  end if;

  select role into v_role from public.profiles where id = v_proposal.author_id for update;
  if v_role = 'student' then
    update public.profiles set role = 'teacher' where id = v_proposal.author_id;
    perform public.write_audit('role.changed', 'profile', v_proposal.author_id::text,
      jsonb_build_object('from', 'student', 'to', 'teacher', 'proposalId', p_id));
  end if;

  begin
    insert into public.courses (slug, owner_id, content, published, listed)
    values (
      p_slug,
      v_proposal.author_id,
      jsonb_build_object('slug', p_slug, 'title', v_proposal.title, 'tagline', left(v_proposal.summary, 160), 'version', '0.1.0'),
      false,
      true
    );
  exception when unique_violation then
    raise exception using errcode = 'PT409', message = 'slug taken', hint = 'slug-taken';
  end;

  update public.course_proposals
  set status = 'approved',
      course_slug = p_slug,
      review_note = nullif(btrim(coalesce(p_note, '')), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = p_id;

  perform public.write_audit('proposal.approved', 'proposal', p_id::text, jsonb_build_object('courseSlug', p_slug));
  return jsonb_build_object('courseSlug', p_slug);
end;
$$;

revoke execute on function public.approve_proposal(uuid, text, text) from public, anon, authenticated;
grant execute on function public.approve_proposal(uuid, text, text) to authenticated;

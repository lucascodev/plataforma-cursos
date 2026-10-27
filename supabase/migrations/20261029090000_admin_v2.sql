-- Admin area, second round: a queue of what needs attention, counters for the menu, filters, profile reports, and account
-- management (end sessions, block, delete). Functions whose parameters change are dropped and recreated with defaults, so
-- PostgREST never sees two overloads and the API that is still deployed keeps working with the arguments it sends.

-- Blocking -----------------------------------------------------------------------------------------------------------------

alter table public.profiles add column if not exists blocked_at timestamptz;

alter table public.courses
  add column if not exists unlisted_note text,
  add constraint courses_unlisted_note_length check (unlisted_note is null or char_length(unlisted_note) <= 500);

comment on column public.courses.unlisted_note is 'Por que o curso saiu do catálogo. Só a equipe lê.';

-- Runs inside write policies as the person writing, so it needs EXECUTE for authenticated. It lives in the private schema,
-- which the Data API does not expose.
create or replace function private.is_blocked()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.blocked_at is not null from public.profiles p where p.id = (select auth.uid())), false);
$$;

revoke execute on function private.is_blocked() from public, anon;
grant execute on function private.is_blocked() to authenticated;

-- Restrictive policies are ANDed with the permissive ones: a blocked person keeps reading but can no longer write, even
-- with an access token issued before the block (it lives up to an hour).
create policy "course_progress_not_blocked_insert" on public.course_progress as restrictive
  for insert to authenticated with check (not (select private.is_blocked()));
create policy "course_progress_not_blocked_update" on public.course_progress as restrictive
  for update to authenticated using (not (select private.is_blocked()));
create policy "course_proposals_not_blocked_insert" on public.course_proposals as restrictive
  for insert to authenticated with check (not (select private.is_blocked()));
create policy "course_proposals_not_blocked_update" on public.course_proposals as restrictive
  for update to authenticated using (not (select private.is_blocked()));
create policy "profiles_not_blocked_update" on public.profiles as restrictive
  for update to authenticated using (not (select private.is_blocked()));
create policy "account_settings_not_blocked_insert" on public.account_settings as restrictive
  for insert to authenticated with check (not (select private.is_blocked()));
create policy "account_settings_not_blocked_update" on public.account_settings as restrictive
  for update to authenticated using (not (select private.is_blocked()));

create or replace function private.assert_not_blocked()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if private.is_blocked() then
    raise exception using errcode = '42501', message = 'blocked', hint = 'account-blocked';
  end if;
end;
$$;

revoke execute on function private.assert_not_blocked() from public, anon, authenticated;

-- The definer functions people call skip RLS, so they check the block themselves.
create or replace function private.lock_owned_course(p_slug text)
returns public.courses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
begin
  perform private.assert_not_blocked();
  select * into v_course from public.courses where slug = p_slug for update;
  if not found or v_course.owner_id is distinct from (select auth.uid()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  return v_course;
end;
$$;

revoke execute on function private.lock_owned_course(text) from public, anon, authenticated;

alter table public.audit_log drop constraint audit_log_action_valid;
alter table public.audit_log add constraint audit_log_action_valid check (action in (
  'proposal.submitted',
  'proposal.approved',
  'proposal.changes_requested',
  'proposal.refused',
  'proposal.withdrawn',
  'role.changed',
  'course.owner_changed',
  'course.listed',
  'course.unlisted',
  'course.deleted',
  'version.submitted',
  'version.withdrawn',
  'version.changes_requested',
  'version.published',
  'version.restored',
  'account.deleted',
  'account.sessions_ended',
  'account.blocked',
  'account.unblocked',
  'profile.reported',
  'report.resolved',
  'report.dismissed'
));

-- Account management -----------------------------------------------------------------------------------------------------

create or replace function private.assert_manageable_person(p_user uuid)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person public.profiles;
begin
  perform public.assert_admin();
  if p_user = (select auth.uid()) then
    raise exception using errcode = 'PT409', message = 'own account', hint = 'cannot-manage-self';
  end if;
  select * into v_person from public.profiles where id = p_user for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'person-not-found';
  end if;
  return v_person;
end;
$$;

revoke execute on function private.assert_manageable_person(uuid) from public, anon, authenticated;

-- Deleting the sessions invalidates every refresh token; the access token still in a browser expires within the hour.
create or replace function public.admin_end_sessions(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_manageable_person(p_user);
  delete from auth.sessions where user_id = p_user;
  perform public.write_audit('account.sessions_ended', 'profile', p_user::text);
end;
$$;

-- Blocking bans the login at Supabase, ends the sessions and stops writes through the policies above.
create or replace function public.admin_set_blocked(p_user uuid, p_blocked boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person public.profiles := private.assert_manageable_person(p_user);
begin
  if p_blocked is null or (v_person.blocked_at is not null) = p_blocked then
    return;
  end if;
  if p_blocked and v_person.role = 'admin' then
    raise exception using errcode = 'PT409', message = 'admin', hint = 'cannot-block-admin';
  end if;
  update public.profiles set blocked_at = case when p_blocked then now() end where id = p_user;
  update auth.users set banned_until = case when p_blocked then 'infinity'::timestamptz end where id = p_user;
  if p_blocked then
    delete from auth.sessions where user_id = p_user;
  end if;
  perform public.write_audit(case when p_blocked then 'account.blocked' else 'account.unblocked' end, 'profile', p_user::text);
end;
$$;

create or replace function public.admin_delete_account(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person public.profiles := private.assert_manageable_person(p_user);
begin
  if exists (select 1 from public.courses c where c.owner_id = p_user) then
    raise exception using errcode = 'PT409', message = 'owns courses', hint = 'owns-courses';
  end if;
  if v_person.role = 'admin' then
    raise exception using errcode = 'PT409', message = 'admin', hint = 'cannot-delete-admin';
  end if;
  perform public.write_audit('account.deleted', 'profile', p_user::text);
  update public.audit_log set actor_id = null where actor_id = p_user;
  delete from public.rate_limits where subject = p_user;
  delete from auth.users where id = p_user;
end;
$$;

-- Roles and owners ---------------------------------------------------------------------------------------------------------

-- Same as before, plus: nobody changes their own role (another admin has to), so an admin never locks themselves out.
create or replace function public.admin_set_role(p_user uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current text;
begin
  perform public.assert_admin();
  if p_role not in ('student', 'teacher', 'admin') then
    raise exception using errcode = 'PT422', message = 'invalid role', hint = 'invalid-role';
  end if;
  if p_user = (select auth.uid()) then
    raise exception using errcode = 'PT409', message = 'own role', hint = 'cannot-change-own-role';
  end if;
  perform 1 from public.profiles where role = 'admin' for update;
  select role into v_current from public.profiles where id = p_user for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'person-not-found';
  end if;
  if v_current = p_role then
    return;
  end if;
  if v_current = 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception using errcode = 'PT409', message = 'last admin', hint = 'last-admin';
  end if;
  if p_role = 'student' and exists (select 1 from public.courses c where c.owner_id = p_user) then
    raise exception using errcode = 'PT409', message = 'owns courses', hint = 'owns-courses';
  end if;
  update public.profiles set role = p_role where id = p_user;
  perform public.write_audit('role.changed', 'profile', p_user::text, jsonb_build_object('from', v_current, 'to', p_role));
end;
$$;

-- Courses go only to someone who already teaches; becoming a teacher is a separate, recorded decision.
create or replace function public.admin_set_course_owner(p_slug text, p_handle text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner public.profiles;
  v_previous uuid;
begin
  perform public.assert_admin();
  select * into v_owner from public.profiles where handle = lower(btrim(coalesce(p_handle, ''))) for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'person-not-found';
  end if;
  if v_owner.role = 'student' then
    raise exception using errcode = 'PT409', message = 'not a teacher', hint = 'owner-not-teacher';
  end if;
  select owner_id into v_previous from public.courses where slug = p_slug for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  if v_previous is not distinct from v_owner.id then
    return;
  end if;
  update public.courses set owner_id = v_owner.id where slug = p_slug;
  perform public.write_audit('course.owner_changed', 'course', p_slug, jsonb_build_object('from', v_previous, 'to', v_owner.id));
end;
$$;

-- p_reason: a code that goes to the history; p_note: free text kept on the course, read only by the team.
drop function if exists public.admin_set_course_listed(text, boolean);
create or replace function public.admin_set_course_listed(p_slug text, p_listed boolean, p_reason text default null, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current boolean;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  perform public.assert_admin();
  if p_reason is not null and p_reason not in ('outdated', 'quality', 'teacher-request', 'reported', 'other') then
    raise exception using errcode = 'PT422', message = 'invalid reason', hint = 'invalid-unlist-reason';
  end if;
  if char_length(coalesce(v_note, '')) > 500 then
    raise exception using errcode = 'PT422', message = 'note too long', hint = 'note-too-long';
  end if;
  select listed into v_current from public.courses where slug = p_slug for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  if v_current = p_listed then
    return;
  end if;
  update public.courses set listed = p_listed, unlisted_note = case when p_listed then null else v_note end where slug = p_slug;
  perform public.write_audit(case when p_listed then 'course.listed' else 'course.unlisted' end, 'course', p_slug,
    case when p_listed or p_reason is null then '{}'::jsonb else jsonb_build_object('reason', p_reason) end);
end;
$$;

-- Lists --------------------------------------------------------------------------------------------------------------------

-- p_status: null (all), 'published', 'review' (a version waits for review), 'draft' (never published), 'unlisted'.
drop function if exists public.admin_list_courses();
create or replace function public.admin_list_courses(p_query text default null, p_status text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := lower(nullif(btrim(coalesce(p_query, '')), ''));
begin
  perform public.assert_admin();
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'slug', c.slug,
      'title', coalesce(c.title, c.slug),
      'version', c.version,
      'published', c.published,
      'listed', c.listed,
      'unlistedNote', c.unlisted_note,
      'owner', public.profile_card_json(c.owner_id),
      'studentCount', (select count(*) from public.course_progress cp where cp.course_slug = c.slug),
      'active7d', (select count(*) from public.course_progress cp where cp.course_slug = c.slug and cp.updated_at > now() - interval '7 days'),
      'updatedAt', c.updated_at,
      'openVersion', (
        select private.course_version_json(v, false) from public.course_versions v
        where v.course_slug = c.slug and v.status in ('draft', 'in_review', 'changes_requested')
      )
    ) order by c.updated_at desc), '[]'::jsonb)
    from public.courses c
    left join public.profiles owner on owner.id = c.owner_id
    where (v_query is null
           or position(v_query in c.slug) > 0
           or position(v_query in lower(coalesce(c.title, ''))) > 0
           or position(v_query in lower(coalesce(owner.display_name, ''))) > 0
           or position(v_query in coalesce(owner.handle, '')) > 0)
      and (p_status is null
           or (p_status = 'published' and c.published and c.listed)
           or (p_status = 'unlisted' and c.published and not c.listed)
           or (p_status = 'draft' and not c.published)
           or (p_status = 'review' and exists (
             select 1 from public.course_versions v where v.course_slug = c.slug and v.status = 'in_review')))
  );
end;
$$;

create or replace function public.admin_list_people(
  p_query text default null,
  p_role text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := lower(nullif(btrim(coalesce(p_query, '')), ''));
  v_items jsonb;
  v_total integer;
begin
  perform public.assert_admin();
  select count(*) into v_total
  from public.profiles p
  where (p_role is null or p.role = p_role or (p_role = 'blocked' and p.blocked_at is not null))
    and (v_query is null or position(v_query in p.handle) > 0 or position(v_query in lower(p.display_name)) > 0);

  select coalesce(jsonb_agg(t.item order by t.created_at desc), '[]'::jsonb)
  into v_items
  from (
    select p.created_at, public.profile_card_json(p.id) || jsonb_build_object(
      'createdAt', p.created_at,
      'coursesOwned', (select count(*) from public.courses c where c.owner_id = p.id),
      'coursesStudying', (select count(*) from public.course_progress cp where cp.user_id = p.id),
      'lastSignInAt', (select u.last_sign_in_at from auth.users u where u.id = p.id),
      'blockedAt', p.blocked_at
    ) as item
    from public.profiles p
    where (p_role is null or p.role = p_role or (p_role = 'blocked' and p.blocked_at is not null))
      and (v_query is null or position(v_query in p.handle) > 0 or position(v_query in lower(p.display_name)) > 0)
    order by p.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 100)
    offset greatest(coalesce(p_offset, 0), 0)
  ) t;
  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

-- p_kind: null (all), 'courses', 'proposals' or 'people'.
drop function if exists public.admin_list_audit(bigint, integer);
create or replace function public.admin_list_audit(p_before bigint default null, p_limit integer default 50, p_kind text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_items jsonb;
  v_last bigint;
  v_count integer;
begin
  perform public.assert_admin();
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'id', t.id,
      'at', t.at,
      'action', t.action,
      'targetType', t.target_type,
      'targetId', t.target_id,
      'targetLabel', case t.target_type
        when 'proposal' then (select p.title from public.course_proposals p where p.id::text = t.target_id)
        when 'profile' then (select p.handle from public.profiles p where p.id::text = t.target_id)
        when 'course' then coalesce((select c.title from public.courses c where c.slug = t.target_id), t.target_id)
        else t.target_id
      end,
      'data', t.data,
      'actor', public.profile_card_json(t.actor_id)
    ) order by t.id desc), '[]'::jsonb),
    min(t.id),
    count(*)
  into v_items, v_last, v_count
  from (
    select a.* from public.audit_log a
    where (p_before is null or a.id < p_before)
      and (p_kind is null
           or (p_kind = 'courses' and (a.action like 'course.%' or a.action like 'version.%'))
           or (p_kind = 'proposals' and a.action like 'proposal.%')
           or (p_kind = 'people' and (a.action like 'role.%' or a.action like 'account.%' or a.action like 'profile.%' or a.action like 'report.%')))
    order by a.id desc
    limit v_limit
  ) t;
  return jsonb_build_object('items', v_items, 'nextBefore', case when v_count = v_limit then v_last end);
end;
$$;

-- What needs attention -----------------------------------------------------------------------------------------------------

create or replace function public.admin_nav_badges()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return jsonb_build_object(
    'pendingProposals', (select count(*) from public.course_proposals where status = 'pending'),
    'versionsInReview', (select count(*) from public.course_versions where status = 'in_review'),
    'openReports', (select count(*) from public.profile_reports where status = 'open')
  );
end;
$$;

-- Oldest first: what has waited the longest comes first.
create or replace function public.admin_attention_queue()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return (
    select coalesce(jsonb_agg(item order by since), '[]'::jsonb)
    from (
      select p.created_at as since, jsonb_build_object('kind', 'proposal', 'id', p.id, 'title', p.title, 'since', p.created_at) as item
      from public.course_proposals p
      where p.status = 'pending'
      union all
      select v.submitted_at, jsonb_build_object(
        'kind', 'version', 'id', v.id, 'title', coalesce(c.title, c.slug), 'semver', v.semver,
        'firstPublication', c.published_version_id is null, 'since', v.submitted_at)
      from public.course_versions v
      join public.courses c on c.slug = v.course_slug
      where v.status = 'in_review'
      union all
      select min(r.created_at), jsonb_build_object(
        'kind', 'report', 'id', r.profile_id, 'title', p.display_name, 'handle', p.handle, 'count', count(*), 'since', min(r.created_at))
      from public.profile_reports r
      join public.profiles p on p.id = r.profile_id
      where r.status = 'open'
      group by r.profile_id, p.display_name, p.handle
      order by 1
      limit 30
    ) queue
  );
end;
$$;

create or replace function public.admin_check_slug(p_slug text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return p_slug ~ '^[a-z0-9-]{1,60}$' and not exists (select 1 from public.courses where slug = p_slug);
end;
$$;

-- How many people completed each of the given progress keys. Only counts; used to show what removing lessons does.
create or replace function public.admin_version_impact(p_id uuid, p_keys text[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_slug text;
begin
  perform public.assert_admin();
  select course_slug into v_slug from public.course_versions where id = p_id;
  if v_slug is null then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  return jsonb_build_object(
    'students', (select count(*) from public.course_progress where course_slug = v_slug),
    'completedRemoved', (
      select coalesce(jsonb_object_agg(key, completed), '{}'::jsonb)
      from (
        select key, (select count(*) from public.course_progress cp
                     where cp.course_slug = v_slug and cp.data -> 'completedItems' ? key) as completed
        from unnest(coalesce(p_keys[1:200], '{}')) as key
      ) counts
    )
  );
end;
$$;

-- Reports ------------------------------------------------------------------------------------------------------------------

create or replace function public.admin_list_reports(p_status text default 'open')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'status', r.status,
      'reason', r.reason,
      'details', r.details,
      'createdAt', r.created_at,
      'resolvedAt', r.resolved_at,
      'profile', public.profile_card_json(r.profile_id),
      'reporter', public.profile_card_json(r.reporter_id)
    ) order by r.created_at desc), '[]'::jsonb)
    from (
      select * from public.profile_reports
      where p_status is null or status = p_status
      order by created_at desc
      limit 200
    ) r
  );
end;
$$;

create or replace function public.admin_resolve_report(p_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_report public.profile_reports;
begin
  perform public.assert_admin();
  if p_decision not in ('resolved', 'dismissed') then
    raise exception using errcode = 'PT422', message = 'invalid decision', hint = 'invalid-decision';
  end if;
  select * into v_report from public.profile_reports where id = p_id for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'report-not-found';
  end if;
  if v_report.status <> 'open' then
    raise exception using errcode = 'PT409', message = 'report closed', hint = 'report-closed';
  end if;
  update public.profile_reports set status = p_decision, resolved_at = now(), resolved_by = (select auth.uid()) where id = p_id;
  perform public.write_audit('report.' || p_decision, 'profile', v_report.profile_id::text, jsonb_build_object('reason', v_report.reason));
end;
$$;

-- Definer functions people call also respect the block.
create or replace function public.report_profile(p_handle text, p_reason text, p_details text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_profile_id uuid;
  v_details text := btrim(coalesce(p_details, ''));
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  perform private.assert_not_blocked();
  perform public.consume_rate_limit('profile-report', 10, interval '1 hour');
  if p_reason is null or p_reason not in ('false-info', 'offensive', 'suspicious-link', 'other') then
    raise exception using errcode = 'PT422', message = 'invalid reason', hint = 'invalid-report-reason';
  end if;
  if char_length(v_details) > 1000 then
    raise exception using errcode = 'PT422', message = 'details too long', hint = 'report-details-too-long';
  end if;
  select p.id into v_profile_id
  from public.profiles p
  where p.handle = lower(btrim(coalesce(p_handle, '')))
    and (p.role = 'teacher' or exists (select 1 from public.courses c where c.owner_id = p.id and c.published));
  if v_profile_id is null then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'profile-not-found';
  end if;
  if v_profile_id = v_uid then
    raise exception using errcode = 'PT422', message = 'own profile', hint = 'cannot-report-self';
  end if;
  insert into public.profile_reports (profile_id, reporter_id, reason, details)
  values (v_profile_id, v_uid, p_reason, v_details)
  on conflict (profile_id, reporter_id) where status = 'open' do nothing;
  if found then
    perform public.write_audit('profile.reported', 'profile', v_profile_id::text, jsonb_build_object('reason', p_reason));
  end if;
end;
$$;

create or replace function public.withdraw_proposal(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
begin
  perform private.assert_not_blocked();
  select * into v_proposal from public.course_proposals where id = p_id for update;
  if not found or v_proposal.author_id is distinct from (select auth.uid()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'proposal-not-found';
  end if;
  if v_proposal.status not in ('pending', 'changes_requested') then
    raise exception using errcode = 'PT409', message = 'proposal is closed', hint = 'proposal-not-open';
  end if;
  update public.course_proposals set status = 'withdrawn' where id = p_id;
  perform public.write_audit('proposal.withdrawn', 'proposal', p_id::text);
end;
$$;

-- Grants -------------------------------------------------------------------------------------------------------------------

revoke execute on function public.admin_end_sessions(uuid) from public, anon, authenticated;
revoke execute on function public.admin_set_blocked(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.admin_delete_account(uuid) from public, anon, authenticated;
revoke execute on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_set_course_owner(text, text) from public, anon, authenticated;
revoke execute on function public.admin_set_course_listed(text, boolean, text, text) from public, anon, authenticated;
revoke execute on function public.admin_list_courses(text, text) from public, anon, authenticated;
revoke execute on function public.admin_list_people(text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.admin_list_audit(bigint, integer, text) from public, anon, authenticated;
revoke execute on function public.admin_nav_badges() from public, anon, authenticated;
revoke execute on function public.admin_attention_queue() from public, anon, authenticated;
revoke execute on function public.admin_check_slug(text) from public, anon, authenticated;
revoke execute on function public.admin_version_impact(uuid, text[]) from public, anon, authenticated;
revoke execute on function public.admin_list_reports(text) from public, anon, authenticated;
revoke execute on function public.admin_resolve_report(uuid, text) from public, anon, authenticated;
revoke execute on function public.report_profile(text, text, text) from public, anon, authenticated;
revoke execute on function public.withdraw_proposal(uuid) from public, anon, authenticated;

grant execute on function public.admin_end_sessions(uuid) to authenticated;
grant execute on function public.admin_set_blocked(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_account(uuid) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_course_owner(text, text) to authenticated;
grant execute on function public.admin_set_course_listed(text, boolean, text, text) to authenticated;
grant execute on function public.admin_list_courses(text, text) to authenticated;
grant execute on function public.admin_list_people(text, text, integer, integer) to authenticated;
grant execute on function public.admin_list_audit(bigint, integer, text) to authenticated;
grant execute on function public.admin_nav_badges() to authenticated;
grant execute on function public.admin_attention_queue() to authenticated;
grant execute on function public.admin_check_slug(text) to authenticated;
grant execute on function public.admin_version_impact(uuid, text[]) to authenticated;
grant execute on function public.admin_list_reports(text) to authenticated;
grant execute on function public.admin_resolve_report(uuid, text) to authenticated;
grant execute on function public.report_profile(text, text, text) to authenticated;
grant execute on function public.withdraw_proposal(uuid) to authenticated;

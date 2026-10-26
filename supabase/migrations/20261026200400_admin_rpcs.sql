-- Functions behind the proposal flow and the admin area. Each one checks who is calling, changes everything it needs in
-- a single transaction and records the action in audit_log.
-- Error protocol read by the API: 42501 = forbidden (HTTP 403), PT404 + hint = not found, PT409 + hint = invalid state,
-- PT422 + hint = invalid input. The hint is a stable code the API turns into a message; the message itself is never shown.

create or replace function public.profile_card_json(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', p.id, 'handle', p.handle, 'displayName', p.display_name, 'avatarUrl', p.avatar_url, 'role', p.role)
  from public.profiles p
  where p.id = p_id;
$$;

create or replace function public.proposal_json(p public.course_proposals)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'status', p.status,
    'title', p.title,
    'summary', p.summary,
    'audience', p.audience,
    'area', p.area,
    'language', p.language,
    'outline', p.outline,
    'experience', p.experience,
    'sampleUrl', p.sample_url,
    'suggestedSlug', p.suggested_slug,
    'reviewNote', p.review_note,
    'reviewedAt', p.reviewed_at,
    'courseSlug', p.course_slug,
    'createdAt', p.created_at,
    'updatedAt', p.updated_at,
    'author', public.profile_card_json(p.author_id)
  );
$$;

revoke execute on function public.profile_card_json(uuid) from public, anon, authenticated;
revoke execute on function public.proposal_json(public.course_proposals) from public, anon, authenticated;

-- Proposals ------------------------------------------------------------------------------------------------------------

create or replace function public.withdraw_proposal(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
begin
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

create or replace function public.admin_list_proposals(p_status text default null, p_limit integer default 50, p_offset integer default 0)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_items jsonb;
  v_total integer;
begin
  perform public.assert_admin();
  select count(*) into v_total from public.course_proposals p where p_status is null or p.status = p_status;
  select coalesce(jsonb_agg(public.proposal_json(t.proposal) order by t.waiting desc, t.created_at desc), '[]'::jsonb)
  into v_items
  from (
    select p as proposal, (p.status = 'pending') as waiting, p.created_at
    from public.course_proposals p
    where p_status is null or p.status = p_status
    order by (p.status = 'pending') desc, p.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 100)
    offset greatest(coalesce(p_offset, 0), 0)
  ) t;
  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

create or replace function public.admin_get_proposal(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
begin
  perform public.assert_admin();
  select * into v_proposal from public.course_proposals where id = p_id;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'proposal-not-found';
  end if;
  return public.proposal_json(v_proposal);
end;
$$;

-- Approving turns the author into a teacher and creates the draft course they own, in one step.
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

  insert into public.courses (slug, owner_id, content, published, listed)
  values (
    p_slug,
    v_proposal.author_id,
    jsonb_build_object('slug', p_slug, 'title', v_proposal.title, 'tagline', left(v_proposal.summary, 160), 'version', '0.1.0'),
    false,
    true
  );

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

-- p_decision: 'changes_requested' or 'refused'. Both need a note so the author knows what to do next.
create or replace function public.review_proposal(p_id uuid, p_decision text, p_note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  perform public.assert_admin();
  if p_decision not in ('changes_requested', 'refused') then
    raise exception using errcode = 'PT422', message = 'invalid decision', hint = 'invalid-decision';
  end if;
  if v_note is null then
    raise exception using errcode = 'PT422', message = 'note required', hint = 'note-required';
  end if;
  select * into v_proposal from public.course_proposals where id = p_id for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'proposal-not-found';
  end if;
  if v_proposal.status <> 'pending' then
    raise exception using errcode = 'PT409', message = 'proposal is not pending', hint = 'proposal-not-pending';
  end if;
  update public.course_proposals
  set status = p_decision, review_note = v_note, reviewed_by = (select auth.uid()), reviewed_at = now()
  where id = p_id;
  perform public.write_audit('proposal.' || p_decision, 'proposal', p_id::text);
end;
$$;

-- Overview and lists ---------------------------------------------------------------------------------------------------

create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return jsonb_build_object(
    'people', jsonb_build_object(
      'student', (select count(*) from public.profiles where role = 'student'),
      'teacher', (select count(*) from public.profiles where role = 'teacher'),
      'admin', (select count(*) from public.profiles where role = 'admin')
    ),
    'pendingProposals', (select count(*) from public.course_proposals where status = 'pending'),
    'courses', jsonb_build_object(
      'draft', (select count(*) from public.courses where not published),
      'published', (select count(*) from public.courses where published and listed),
      'unlisted', (select count(*) from public.courses where published and not listed)
    ),
    'activeStudents30d', (
      select count(distinct cp.user_id) from public.course_progress cp where cp.updated_at > now() - interval '30 days'
    )
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
  -- position() instead of LIKE so % and _ typed in the search box are plain characters.
  select count(*) into v_total
  from public.profiles p
  where (p_role is null or p.role = p_role)
    and (v_query is null or position(v_query in p.handle) > 0 or position(v_query in lower(p.display_name)) > 0);

  select coalesce(jsonb_agg(t.item order by t.created_at desc), '[]'::jsonb)
  into v_items
  from (
    select p.created_at, public.profile_card_json(p.id) || jsonb_build_object(
      'createdAt', p.created_at,
      'coursesOwned', (select count(*) from public.courses c where c.owner_id = p.id)
    ) as item
    from public.profiles p
    where (p_role is null or p.role = p_role)
      and (v_query is null or position(v_query in p.handle) > 0 or position(v_query in lower(p.display_name)) > 0)
    order by p.created_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 100)
    offset greatest(coalesce(p_offset, 0), 0)
  ) t;
  return jsonb_build_object('items', v_items, 'total', v_total);
end;
$$;

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
  -- Locking every admin row serializes concurrent demotions, so two admins cannot demote each other at once.
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

-- Student counts are aggregates; nobody's notes or journal leave course_progress.
create or replace function public.admin_list_courses()
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
      'slug', c.slug,
      'title', coalesce(c.title, c.slug),
      'version', c.version,
      'published', c.published,
      'listed', c.listed,
      'owner', public.profile_card_json(c.owner_id),
      'studentCount', (select count(*) from public.course_progress cp where cp.course_slug = c.slug),
      'updatedAt', c.updated_at
    ) order by c.updated_at desc), '[]'::jsonb)
    from public.courses c
  );
end;
$$;

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
  select owner_id into v_previous from public.courses where slug = p_slug for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  if v_previous is not distinct from v_owner.id then
    return;
  end if;
  if v_owner.role = 'student' then
    update public.profiles set role = 'teacher' where id = v_owner.id;
    perform public.write_audit('role.changed', 'profile', v_owner.id::text,
      jsonb_build_object('from', 'student', 'to', 'teacher', 'courseSlug', p_slug));
  end if;
  update public.courses set owner_id = v_owner.id where slug = p_slug;
  perform public.write_audit('course.owner_changed', 'course', p_slug, jsonb_build_object('from', v_previous, 'to', v_owner.id));
end;
$$;

create or replace function public.admin_set_course_listed(p_slug text, p_listed boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current boolean;
begin
  perform public.assert_admin();
  select listed into v_current from public.courses where slug = p_slug for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  if v_current = p_listed then
    return;
  end if;
  update public.courses set listed = p_listed where slug = p_slug;
  perform public.write_audit(case when p_listed then 'course.listed' else 'course.unlisted' end, 'course', p_slug);
end;
$$;

-- A course someone has studied is never deleted: its progress would be lost. It can be taken out of the catalog instead.
create or replace function public.admin_delete_course(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  perform 1 from public.courses where slug = p_slug for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  if exists (select 1 from public.course_progress cp where cp.course_slug = p_slug) then
    raise exception using errcode = 'PT409', message = 'course has students', hint = 'course-has-students';
  end if;
  delete from public.courses where slug = p_slug;
  perform public.write_audit('course.deleted', 'course', p_slug);
end;
$$;

create or replace function public.admin_list_audit(p_before bigint default null, p_limit integer default 50)
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
    where p_before is null or a.id < p_before
    order by a.id desc
    limit v_limit
  ) t;
  return jsonb_build_object('items', v_items, 'nextBefore', case when v_count = v_limit then v_last end);
end;
$$;

-- Public teacher page. Readable without login; the student count only appears when the teacher opted in.
create or replace function public.public_teacher_profile(p_handle text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_courses jsonb;
begin
  select * into v_profile from public.profiles where handle = lower(btrim(coalesce(p_handle, '')));
  if not found then
    return null;
  end if;
  if v_profile.role <> 'teacher' and not exists (
    select 1 from public.courses c where c.owner_id = v_profile.id and c.published
  ) then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', c.slug,
    'title', coalesce(c.title, c.slug),
    'tagline', coalesce(c.content ->> 'tagline', '')
  ) order by c.title), '[]'::jsonb)
  into v_courses
  from public.courses c
  where c.owner_id = v_profile.id and c.published and c.listed;

  return jsonb_build_object(
    'handle', v_profile.handle,
    'displayName', v_profile.display_name,
    'avatarUrl', v_profile.avatar_url,
    'bio', v_profile.bio,
    'links', v_profile.links,
    'courses', v_courses,
    'studentCount', case when v_profile.show_student_count then (
      select count(distinct cp.user_id)
      from public.course_progress cp
      join public.courses c on c.slug = cp.course_slug
      where c.owner_id = v_profile.id and c.published
    ) end
  );
end;
$$;

-- Supabase grants execute to anon and authenticated by default. Close everything, then open only what each caller needs.
revoke execute on function public.withdraw_proposal(uuid) from public, anon, authenticated;
revoke execute on function public.admin_list_proposals(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.admin_get_proposal(uuid) from public, anon, authenticated;
revoke execute on function public.approve_proposal(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.review_proposal(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.admin_overview() from public, anon, authenticated;
revoke execute on function public.admin_list_people(text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.admin_set_role(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_list_courses() from public, anon, authenticated;
revoke execute on function public.admin_set_course_owner(text, text) from public, anon, authenticated;
revoke execute on function public.admin_set_course_listed(text, boolean) from public, anon, authenticated;
revoke execute on function public.admin_delete_course(text) from public, anon, authenticated;
revoke execute on function public.admin_list_audit(bigint, integer) from public, anon, authenticated;
revoke execute on function public.public_teacher_profile(text) from public, anon, authenticated;

grant execute on function public.withdraw_proposal(uuid) to authenticated;
grant execute on function public.admin_list_proposals(text, integer, integer) to authenticated;
grant execute on function public.admin_get_proposal(uuid) to authenticated;
grant execute on function public.approve_proposal(uuid, text, text) to authenticated;
grant execute on function public.review_proposal(uuid, text, text) to authenticated;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_list_people(text, text, integer, integer) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_list_courses() to authenticated;
grant execute on function public.admin_set_course_owner(text, text) to authenticated;
grant execute on function public.admin_set_course_listed(text, boolean) to authenticated;
grant execute on function public.admin_delete_course(text) to authenticated;
grant execute on function public.admin_list_audit(bigint, integer) to authenticated;
grant execute on function public.public_teacher_profile(text) to anon, authenticated;

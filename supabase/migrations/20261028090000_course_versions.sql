-- Courses are written in the platform editor and published as versions. A teacher edits one open version (draft), sends
-- it for review, and an admin publishes it. courses.content keeps being the published version, written only by
-- admin_publish_version, so the public pages, RLS and caching stay as they are.
-- Status flow: draft -> in_review -> (changes_requested -> in_review)* -> published -> superseded.
-- Error protocol as in the admin functions: 42501 forbidden, PT404/PT409/PT422 + hint.

create table if not exists public.course_versions (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.courses (slug) on update cascade on delete cascade,
  status text not null default 'draft',
  semver text,
  kind text,
  content jsonb not null,
  revision bigint not null default 1,
  based_on_id uuid references public.course_versions (id) on delete set null,
  submit_message text,
  review_items jsonb not null default '[]'::jsonb,
  release_note text,
  created_by uuid references public.profiles (id) on delete set null,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  published_at timestamptz,
  constraint course_versions_status_valid check (status in ('draft', 'in_review', 'changes_requested', 'published', 'superseded')),
  constraint course_versions_semver_format check (semver is null or semver ~ '^\d{1,4}\.\d{1,4}\.\d{1,4}$'),
  constraint course_versions_semver_when_sent check (status = 'draft' or semver is not null),
  constraint course_versions_kind_valid check (kind is null or kind in ('first', 'patch', 'minor', 'major')),
  constraint course_versions_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint course_versions_content_matches_slug check (content ->> 'slug' = course_slug),
  constraint course_versions_content_size check (octet_length(content::text) <= 1000000),
  constraint course_versions_submit_message_length check (submit_message is null or char_length(submit_message) <= 1000),
  constraint course_versions_release_note_length check (release_note is null or char_length(release_note) <= 2000),
  constraint course_versions_review_items_shape check (
    jsonb_typeof(review_items) = 'array' and jsonb_array_length(review_items) <= 20 and octet_length(review_items::text) <= 16000
  )
);

comment on table public.course_versions is 'Versões de cada curso: rascunho, revisão e histórico do que foi publicado. Acesso só por funções do banco.';

create unique index if not exists course_versions_one_open_idx
  on public.course_versions (course_slug) where status in ('draft', 'in_review', 'changes_requested');
create unique index if not exists course_versions_one_published_idx
  on public.course_versions (course_slug) where status = 'published';
create unique index if not exists course_versions_semver_idx
  on public.course_versions (course_slug, semver) where status in ('published', 'superseded');
create index if not exists course_versions_course_idx on public.course_versions (course_slug, created_at desc);
create index if not exists course_versions_in_review_idx on public.course_versions (submitted_at) where status = 'in_review';

alter table public.course_versions enable row level security;
alter table public.course_versions force row level security;

-- No grants and no policies: drafts are private to their author and the admins, and only the functions below read them.
revoke all on table public.course_versions from anon, authenticated, public;

alter table public.courses
  add column if not exists published_version_id uuid references public.course_versions (id) on delete set null;

-- Every course gets its current content as a version: the published ones as published, the rest as the open draft.
insert into public.course_versions (course_slug, status, semver, kind, content, created_by, created_at, published_at)
select
  c.slug,
  case when c.published then 'published' else 'draft' end,
  case when c.published and c.content ->> 'version' ~ '^\d{1,4}\.\d{1,4}\.\d{1,4}$' then c.content ->> 'version'
       when c.published then '1.0.0' end,
  case when c.published then 'first' end,
  private.course_content_with_item_ids(c.content),
  c.owner_id,
  c.created_at,
  case when c.published then c.updated_at end
from public.courses c
where not exists (select 1 from public.course_versions v where v.course_slug = c.slug);

update public.courses c
set published_version_id = v.id
from public.course_versions v
where v.course_slug = c.slug and v.status = 'published' and c.published_version_id is null;

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
  'version.restored'
));

-- Helpers ----------------------------------------------------------------------------------------------------------------

create or replace function private.next_semver(p_current text, p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_parts integer[];
begin
  if p_current is null then
    return '1.0.0';
  end if;
  v_parts := pg_catalog.string_to_array(p_current, '.')::integer[];
  return case p_kind
    when 'major' then (v_parts[1] + 1) || '.0.0'
    when 'minor' then v_parts[1] || '.' || (v_parts[2] + 1) || '.0'
    else v_parts[1] || '.' || v_parts[2] || '.' || (v_parts[3] + 1)
  end;
end;
$$;

create or replace function private.course_version_json(p_version public.course_versions, p_with_content boolean)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_version.id,
    'courseSlug', p_version.course_slug,
    'status', p_version.status,
    'semver', p_version.semver,
    'kind', p_version.kind,
    'revision', p_version.revision,
    'submitMessage', p_version.submit_message,
    'reviewItems', p_version.review_items,
    'releaseNote', p_version.release_note,
    'basedOnSemver', (select b.semver from public.course_versions b where b.id = p_version.based_on_id),
    'createdAt', p_version.created_at,
    'updatedAt', p_version.updated_at,
    'submittedAt', p_version.submitted_at,
    'reviewedAt', p_version.reviewed_at,
    'publishedAt', p_version.published_at
  ) || case when p_with_content then jsonb_build_object('content', p_version.content) else '{}'::jsonb end;
$$;

-- The course row, locked, when the caller owns it. Anyone else gets "not found", so drafts never reveal they exist.
create or replace function private.lock_owned_course(p_slug text)
returns public.courses
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
begin
  select * into v_course from public.courses where slug = p_slug for update;
  if not found or v_course.owner_id is distinct from (select auth.uid()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  return v_course;
end;
$$;

create or replace function private.lock_owned_version(p_id uuid)
returns public.course_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions;
begin
  select * into v_version from public.course_versions where id = p_id;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  perform private.lock_owned_course(v_version.course_slug);
  select * into v_version from public.course_versions where id = p_id for update;
  return v_version;
end;
$$;

create or replace function private.assert_revision(p_version public.course_versions, p_revision bigint)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_revision is null or p_revision <> p_version.revision then
    raise exception using errcode = 'PT409', message = 'stale revision', hint = 'version-conflict';
  end if;
end;
$$;

revoke execute on function private.next_semver(text, text) from public, anon, authenticated;
revoke execute on function private.course_version_json(public.course_versions, boolean) from public, anon, authenticated;
revoke execute on function private.lock_owned_course(text) from public, anon, authenticated;
revoke execute on function private.lock_owned_version(uuid) from public, anon, authenticated;
revoke execute on function private.assert_revision(public.course_versions, bigint) from public, anon, authenticated;

-- Teacher ----------------------------------------------------------------------------------------------------------------

create or replace function public.teacher_get_open_version(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
  v_open public.course_versions;
  v_published public.course_versions;
begin
  select * into v_course from public.courses where slug = p_slug;
  if not found or v_course.owner_id is distinct from (select auth.uid()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  select * into v_open from public.course_versions
  where course_slug = p_slug and status in ('draft', 'in_review', 'changes_requested');
  select * into v_published from public.course_versions where id = v_course.published_version_id;
  return jsonb_build_object(
    'course', jsonb_build_object('slug', v_course.slug, 'published', v_course.published, 'listed', v_course.listed),
    'publishedVersion', case when v_published.id is not null then private.course_version_json(v_published, false) end,
    'openVersion', case when v_open.id is not null then private.course_version_json(v_open, true) end
  );
end;
$$;

-- Opens a draft from the published version. Calling it again while a version is open returns that version.
create or replace function public.teacher_open_draft(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses := private.lock_owned_course(p_slug);
  v_version public.course_versions;
begin
  select * into v_version from public.course_versions
  where course_slug = p_slug and status in ('draft', 'in_review', 'changes_requested');
  if found then
    return private.course_version_json(v_version, true);
  end if;
  insert into public.course_versions (course_slug, content, based_on_id, created_by)
  select p_slug, private.course_content_with_item_ids(coalesce(pv.content, v_course.content)), pv.id, (select auth.uid())
  from (select 1) as one
  left join public.course_versions pv on pv.id = v_course.published_version_id
  returning * into v_version;
  return private.course_version_json(v_version, true);
end;
$$;

-- Autosave. The revision makes two tabs editing the same draft fail loudly instead of overwriting each other.
create or replace function public.teacher_save_draft(p_id uuid, p_content jsonb, p_revision bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions := private.lock_owned_version(p_id);
begin
  perform public.consume_rate_limit('draft-write', 600, interval '10 minutes');
  if v_version.status not in ('draft', 'changes_requested') then
    raise exception using errcode = 'PT409', message = 'version is locked', hint = 'version-locked';
  end if;
  perform private.assert_revision(v_version, p_revision);
  if p_content is null or jsonb_typeof(p_content) <> 'object' or p_content ->> 'slug' is distinct from v_version.course_slug then
    raise exception using errcode = 'PT422', message = 'invalid content', hint = 'invalid-content';
  end if;
  update public.course_versions
  set content = p_content, revision = revision + 1, updated_at = now()
  where id = p_id;
  return v_version.revision + 1;
end;
$$;

-- p_kind is ignored for the first publication, which is always 1.0.0. The API checks the content before calling this;
-- the admin checks it again before publishing.
create or replace function public.teacher_submit_version(p_id uuid, p_kind text, p_message text, p_revision bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions := private.lock_owned_version(p_id);
  v_published_semver text;
  v_kind text;
begin
  perform public.consume_rate_limit('version-submit', 20, interval '1 hour');
  if v_version.status not in ('draft', 'changes_requested') then
    raise exception using errcode = 'PT409', message = 'version is locked', hint = 'version-locked';
  end if;
  perform private.assert_revision(v_version, p_revision);
  if exists (select 1 from jsonb_array_elements(v_version.review_items) item where not coalesce((item ->> 'resolved')::boolean, false)) then
    raise exception using errcode = 'PT409', message = 'review items open', hint = 'review-items-open';
  end if;
  select pv.semver into v_published_semver
  from public.courses c join public.course_versions pv on pv.id = c.published_version_id
  where c.slug = v_version.course_slug;
  v_kind := case when v_published_semver is null then 'first' else p_kind end;
  if v_kind not in ('first', 'patch', 'minor', 'major') then
    raise exception using errcode = 'PT422', message = 'invalid kind', hint = 'invalid-version-kind';
  end if;
  update public.course_versions
  set status = 'in_review',
      kind = v_kind,
      semver = private.next_semver(v_published_semver, v_kind),
      submit_message = nullif(btrim(coalesce(p_message, '')), ''),
      submitted_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_id
  returning * into v_version;
  perform public.write_audit('version.submitted', 'course', v_version.course_slug,
    jsonb_build_object('versionId', v_version.id, 'semver', v_version.semver));
  return private.course_version_json(v_version, false);
end;
$$;

-- Takes a version back from the review queue so it can be edited again.
create or replace function public.teacher_withdraw_version(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions := private.lock_owned_version(p_id);
begin
  if v_version.status <> 'in_review' then
    raise exception using errcode = 'PT409', message = 'version not in review', hint = 'version-not-in-review';
  end if;
  update public.course_versions
  set status = 'draft', revision = revision + 1, updated_at = now()
  where id = p_id
  returning * into v_version;
  perform public.write_audit('version.withdrawn', 'course', v_version.course_slug,
    jsonb_build_object('versionId', v_version.id, 'semver', v_version.semver));
  return private.course_version_json(v_version, false);
end;
$$;

create or replace function public.teacher_resolve_review_item(p_id uuid, p_item_id text, p_resolved boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions := private.lock_owned_version(p_id);
begin
  if v_version.status <> 'changes_requested' then
    raise exception using errcode = 'PT409', message = 'no review to answer', hint = 'version-not-changes-requested';
  end if;
  if not exists (select 1 from jsonb_array_elements(v_version.review_items) item where item ->> 'id' = p_item_id) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'review-item-not-found';
  end if;
  update public.course_versions
  set review_items = (
    select jsonb_agg(
      case when item ->> 'id' = p_item_id then item || jsonb_build_object('resolved', coalesce(p_resolved, false)) else item end
      order by position
    )
    from jsonb_array_elements(v_version.review_items) with ordinality as items(item, position)
  ),
  updated_at = now()
  where id = p_id
  returning * into v_version;
  return v_version.review_items;
end;
$$;

-- Admin ------------------------------------------------------------------------------------------------------------------

create or replace function public.admin_list_versions(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  if not exists (select 1 from public.courses where slug = p_slug) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  return (
    select coalesce(jsonb_agg(private.course_version_json(v, false)
      order by v.created_at desc, pg_catalog.string_to_array(v.semver, '.')::integer[] desc nulls first), '[]'::jsonb)
    from public.course_versions v
    where v.course_slug = p_slug
  );
end;
$$;

-- Returns the version and, for the diff, the content that is published now.
create or replace function public.admin_get_version(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions;
  v_course public.courses;
begin
  perform public.assert_admin();
  select * into v_version from public.course_versions where id = p_id;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  select * into v_course from public.courses where slug = v_version.course_slug;
  return jsonb_build_object(
    'version', private.course_version_json(v_version, true),
    'course', jsonb_build_object(
      'slug', v_course.slug,
      'title', coalesce(v_course.title, v_course.slug),
      'published', v_course.published,
      'owner', public.profile_card_json(v_course.owner_id),
      'studentCount', (select count(*) from public.course_progress cp where cp.course_slug = v_course.slug)
    ),
    'publishedContent', (select pv.content from public.course_versions pv where pv.id = v_course.published_version_id)
  );
end;
$$;

-- The API validates the content with the course schema before calling this. The revision ties the publication to the
-- exact content that was validated.
create or replace function public.admin_publish_version(p_id uuid, p_release_note text, p_revision bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions;
  v_content jsonb;
begin
  perform public.assert_admin();
  select * into v_version from public.course_versions where id = p_id;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  perform 1 from public.courses where slug = v_version.course_slug for update;
  select * into v_version from public.course_versions where id = p_id for update;
  if v_version.status <> 'in_review' then
    raise exception using errcode = 'PT409', message = 'version not in review', hint = 'version-not-in-review';
  end if;
  perform private.assert_revision(v_version, p_revision);

  v_content := private.course_content_with_item_ids(v_version.content)
    || jsonb_build_object('version', v_version.semver, 'updatedAt', to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'));

  update public.course_versions set status = 'superseded', updated_at = now()
  where course_slug = v_version.course_slug and status = 'published';

  update public.course_versions
  set status = 'published',
      content = v_content,
      release_note = nullif(btrim(coalesce(p_release_note, '')), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      published_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_id
  returning * into v_version;

  update public.courses
  set content = v_content, published = true, published_version_id = p_id
  where slug = v_version.course_slug;

  perform public.write_audit('version.published', 'course', v_version.course_slug,
    jsonb_build_object('versionId', v_version.id, 'semver', v_version.semver));
  return private.course_version_json(v_version, false);
end;
$$;

-- p_items: the points the teacher has to address, as a list of texts. Each one becomes a checklist item in the editor.
create or replace function public.admin_request_version_changes(p_id uuid, p_items jsonb, p_revision bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.course_versions;
  v_items jsonb;
begin
  perform public.assert_admin();
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20
     or not private.is_text_list_within(p_items, 500)
     or jsonb_path_exists(p_items, '$[*] ? (@.type() != "string")') then
    raise exception using errcode = 'PT422', message = 'invalid items', hint = 'review-items-required';
  end if;
  select * into v_version from public.course_versions where id = p_id for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  if v_version.status <> 'in_review' then
    raise exception using errcode = 'PT409', message = 'version not in review', hint = 'version-not-in-review';
  end if;
  perform private.assert_revision(v_version, p_revision);
  select jsonb_agg(jsonb_build_object('id', 'r' || position, 'text', btrim(item), 'resolved', false) order by position)
  into v_items
  from jsonb_array_elements_text(p_items) with ordinality as items(item, position);
  update public.course_versions
  set status = 'changes_requested',
      review_items = v_items,
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_id
  returning * into v_version;
  perform public.write_audit('version.changes_requested', 'course', v_version.course_slug,
    jsonb_build_object('versionId', v_version.id, 'semver', v_version.semver, 'items', jsonb_array_length(v_items)));
  return private.course_version_json(v_version, false);
end;
$$;

-- Brings back the content of a published or older version as a new draft. Refused while another version is open.
create or replace function public.admin_restore_version(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.course_versions;
  v_version public.course_versions;
begin
  perform public.assert_admin();
  select * into v_source from public.course_versions where id = p_id;
  if not found then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'version-not-found';
  end if;
  if v_source.status not in ('published', 'superseded') then
    raise exception using errcode = 'PT409', message = 'only sent versions', hint = 'version-not-restorable';
  end if;
  perform 1 from public.courses where slug = v_source.course_slug for update;
  if exists (select 1 from public.course_versions
             where course_slug = v_source.course_slug and status in ('draft', 'in_review', 'changes_requested')) then
    raise exception using errcode = 'PT409', message = 'a version is open', hint = 'open-version-exists';
  end if;
  insert into public.course_versions (course_slug, content, based_on_id, created_by)
  values (
    v_source.course_slug,
    v_source.content,
    (select c.published_version_id from public.courses c where c.slug = v_source.course_slug),
    (select auth.uid())
  )
  returning * into v_version;
  perform public.write_audit('version.restored', 'course', v_source.course_slug,
    jsonb_build_object('versionId', v_version.id, 'fromSemver', v_source.semver));
  return private.course_version_json(v_version, false);
end;
$$;

-- Course list for the admin area, now with the open version so a version waiting for review shows up.
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
      'updatedAt', c.updated_at,
      'openVersion', (
        select private.course_version_json(v, false) from public.course_versions v
        where v.course_slug = c.slug and v.status in ('draft', 'in_review', 'changes_requested')
      )
    ) order by c.updated_at desc), '[]'::jsonb)
    from public.courses c
  );
end;
$$;

-- Proposals ----------------------------------------------------------------------------------------------------------------

-- Approving now also opens the first draft, so the new teacher lands straight in the editor.
create or replace function public.approve_proposal(p_id uuid, p_slug text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal public.course_proposals;
  v_role text;
  v_content jsonb;
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

  v_content := jsonb_build_object(
    'slug', p_slug,
    'title', v_proposal.title,
    'tagline', left(v_proposal.summary, 240),
    'description', v_proposal.summary,
    'audience', left(v_proposal.audience, 200),
    'version', '0.1.0',
    'modules', coalesce((
      select jsonb_agg(jsonb_build_object('id', 'm' || position, 'shortTitle', left(item, 40), 'title', item) order by position)
      from jsonb_array_elements_text(v_proposal.outline) with ordinality as outline(item, position)
    ), '[]'::jsonb)
  );

  begin
    insert into public.courses (slug, owner_id, content, published, listed)
    values (p_slug, v_proposal.author_id, v_content, false, true);
  exception when unique_violation then
    raise exception using errcode = 'PT409', message = 'slug taken', hint = 'slug-taken';
  end;

  insert into public.course_versions (course_slug, content, created_by)
  values (p_slug, v_content, v_proposal.author_id);

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

-- Public -----------------------------------------------------------------------------------------------------------------

-- What changed in each published version of a course, for its public page.
create or replace function public.public_course_releases(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'semver', v.semver,
    'kind', v.kind,
    'releaseNote', v.release_note,
    'publishedAt', v.published_at
  ) order by pg_catalog.string_to_array(v.semver, '.')::integer[] desc), '[]'::jsonb)
  from public.course_versions v
  join public.courses c on c.slug = v.course_slug
  where v.course_slug = p_slug and c.published and v.status in ('published', 'superseded');
$$;

revoke execute on function public.teacher_get_open_version(text) from public, anon, authenticated;
revoke execute on function public.teacher_open_draft(text) from public, anon, authenticated;
revoke execute on function public.teacher_save_draft(uuid, jsonb, bigint) from public, anon, authenticated;
revoke execute on function public.teacher_submit_version(uuid, text, text, bigint) from public, anon, authenticated;
revoke execute on function public.teacher_withdraw_version(uuid) from public, anon, authenticated;
revoke execute on function public.teacher_resolve_review_item(uuid, text, boolean) from public, anon, authenticated;
revoke execute on function public.admin_list_versions(text) from public, anon, authenticated;
revoke execute on function public.admin_get_version(uuid) from public, anon, authenticated;
revoke execute on function public.admin_publish_version(uuid, text, bigint) from public, anon, authenticated;
revoke execute on function public.admin_request_version_changes(uuid, jsonb, bigint) from public, anon, authenticated;
revoke execute on function public.admin_restore_version(uuid) from public, anon, authenticated;
revoke execute on function public.admin_list_courses() from public, anon, authenticated;
revoke execute on function public.approve_proposal(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.public_course_releases(text) from public, anon, authenticated;

grant execute on function public.teacher_get_open_version(text) to authenticated;
grant execute on function public.teacher_open_draft(text) to authenticated;
grant execute on function public.teacher_save_draft(uuid, jsonb, bigint) to authenticated;
grant execute on function public.teacher_submit_version(uuid, text, text, bigint) to authenticated;
grant execute on function public.teacher_withdraw_version(uuid) to authenticated;
grant execute on function public.teacher_resolve_review_item(uuid, text, boolean) to authenticated;
grant execute on function public.admin_list_versions(text) to authenticated;
grant execute on function public.admin_get_version(uuid) to authenticated;
grant execute on function public.admin_publish_version(uuid, text, bigint) to authenticated;
grant execute on function public.admin_request_version_changes(uuid, jsonb, bigint) to authenticated;
grant execute on function public.admin_restore_version(uuid) to authenticated;
grant execute on function public.admin_list_courses() to authenticated;
grant execute on function public.approve_proposal(uuid, text, text) to authenticated;
grant execute on function public.public_course_releases(text) to anon, authenticated;

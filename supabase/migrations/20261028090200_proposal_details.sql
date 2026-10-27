-- Proposals gain the level and the expected length of the course, and record when the author accepted the platform's
-- commitments (open license, free for students, every version reviewed). Older rows keep these empty.
-- Profile links gain an optional kind, so the public page can show the right icon.

alter table public.course_proposals
  add column if not exists level text,
  add column if not exists duration text,
  add column if not exists commitments_accepted_at timestamptz;

alter table public.course_proposals
  add constraint course_proposals_level_valid check (level is null or level in ('beginner', 'intermediate', 'advanced')),
  add constraint course_proposals_duration_valid check (
    duration is null or duration in ('up-to-3-months', '3-to-6-months', '6-to-12-months', 'over-12-months')
  );

grant insert (level, duration, commitments_accepted_at) on table public.course_proposals to authenticated;
grant update (level, duration) on table public.course_proposals to authenticated;

-- The author only says "accepted"; the time is always the database's, and it never changes afterwards.
create or replace function public.course_proposals_stamp_commitments()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.commitments_accepted_at := case when new.commitments_accepted_at is not null then now() end;
  else
    new.commitments_accepted_at := old.commitments_accepted_at;
  end if;
  return new;
end;
$$;

create trigger course_proposals_stamp_commitments
  before insert or update on public.course_proposals
  for each row execute function public.course_proposals_stamp_commitments();

revoke execute on function public.course_proposals_stamp_commitments() from public, anon, authenticated;

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
    'level', p.level,
    'duration', p.duration,
    'outline', p.outline,
    'experience', p.experience,
    'sampleUrl', p.sample_url,
    'suggestedSlug', p.suggested_slug,
    'commitmentsAcceptedAt', p.commitments_accepted_at,
    'reviewNote', p.review_note,
    'reviewedAt', p.reviewed_at,
    'courseSlug', p.course_slug,
    'createdAt', p.created_at,
    'updatedAt', p.updated_at,
    'author', public.profile_card_json(p.author_id)
  );
$$;

revoke execute on function public.proposal_json(public.course_proposals) from public, anon, authenticated;

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
      or (link ? 'kind' and coalesce(link ->> 'kind', '') not in ('site', 'linkedin', 'github', 'other'))
  );
$$;

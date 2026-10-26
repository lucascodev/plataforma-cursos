-- Course proposals sent through the platform. The author writes the content columns; status and review fields change
-- only through the review functions. Editing a proposal after changes were requested sends it back to the queue.

create table if not exists public.course_proposals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  title text not null,
  summary text not null,
  audience text not null,
  area text not null,
  language text not null default 'pt-BR',
  outline jsonb not null,
  experience text not null default '',
  sample_url text,
  suggested_slug text,
  review_note text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  course_slug text references public.courses (slug) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_proposals_status_valid check (status in ('pending', 'changes_requested', 'approved', 'refused', 'withdrawn')),
  constraint course_proposals_title_length check (char_length(btrim(title)) between 3 and 120),
  constraint course_proposals_summary_length check (char_length(btrim(summary)) between 1 and 2000),
  constraint course_proposals_audience_length check (char_length(btrim(audience)) between 1 and 400),
  constraint course_proposals_area_length check (char_length(btrim(area)) between 1 and 60),
  constraint course_proposals_language_format check (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  constraint course_proposals_outline_shape check (
    jsonb_typeof(outline) = 'array'
    and jsonb_array_length(outline) between 1 and 30
    and not jsonb_path_exists(outline, '$[*] ? (@.type() != "string")')
    and octet_length(outline::text) <= 8000
  ),
  constraint course_proposals_experience_length check (char_length(experience) <= 2000),
  constraint course_proposals_sample_url_format check (sample_url is null or (sample_url like 'https://%' and char_length(sample_url) <= 300)),
  constraint course_proposals_suggested_slug_format check (suggested_slug is null or suggested_slug ~ '^[a-z0-9-]{1,60}$'),
  constraint course_proposals_review_note_length check (review_note is null or char_length(review_note) <= 2000)
);

comment on table public.course_proposals is 'Propostas de curso. O autor vê e edita as próprias enquanto estão abertas; admin vê todas.';

create index if not exists course_proposals_author_idx on public.course_proposals (author_id, created_at desc);
create index if not exists course_proposals_status_idx on public.course_proposals (status, created_at desc);

alter table public.course_proposals enable row level security;
alter table public.course_proposals force row level security;

revoke all on table public.course_proposals from anon, authenticated, public;
grant select on table public.course_proposals to authenticated;
grant insert (title, summary, audience, area, language, outline, experience, sample_url, suggested_slug)
  on table public.course_proposals to authenticated;
grant update (title, summary, audience, area, language, outline, experience, sample_url, suggested_slug)
  on table public.course_proposals to authenticated;

create policy "course_proposals_select_own_or_admin" on public.course_proposals
  for select to authenticated
  using (author_id = (select auth.uid()) or (select public.is_admin()));

create policy "course_proposals_insert_own" on public.course_proposals
  for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'pending' and reviewed_by is null and course_slug is null);

create policy "course_proposals_update_own_open" on public.course_proposals
  for update to authenticated
  using (author_id = (select auth.uid()) and status in ('pending', 'changes_requested'))
  with check (author_id = (select auth.uid()));

-- At most 3 open proposals and 20 in total per person, so one account cannot flood the review queue.
create or replace function public.course_proposals_limit_rows()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
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

create trigger course_proposals_limit_rows
  before insert on public.course_proposals
  for each row execute function public.course_proposals_limit_rows();

-- The author editing a proposal that came back with changes requested puts it back in the queue.
create or replace function public.course_proposals_before_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status = 'changes_requested' and new.status = old.status then
    new.status := 'pending';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger course_proposals_before_update
  before update on public.course_proposals
  for each row execute function public.course_proposals_before_update();

create or replace function public.course_proposals_audit_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.write_audit('proposal.submitted', 'proposal', new.id::text, '{}'::jsonb);
  return null;
end;
$$;

create trigger course_proposals_audit_insert
  after insert on public.course_proposals
  for each row execute function public.course_proposals_audit_insert();

revoke execute on function public.course_proposals_audit_insert() from public, anon, authenticated;
revoke execute on function public.course_proposals_limit_rows() from public, anon, authenticated;
revoke execute on function public.course_proposals_before_update() from public, anon, authenticated;

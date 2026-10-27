-- Anyone signed in can warn the team about a public profile. The teacher never learns who reported; the admin area reads
-- the reports in a later release. One open report per person and profile, and a few per hour.

create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null,
  details text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null,
  constraint profile_reports_reason_valid check (reason in ('false-info', 'offensive', 'suspicious-link', 'other')),
  constraint profile_reports_details_length check (char_length(details) <= 1000),
  constraint profile_reports_status_valid check (status in ('open', 'resolved', 'dismissed'))
);

comment on table public.profile_reports is 'Avisos sobre perfis públicos. Sem acesso pela API; quem avisou nunca aparece para a pessoa avisada.';

create unique index if not exists profile_reports_one_open_idx
  on public.profile_reports (profile_id, reporter_id) where status = 'open';
create index if not exists profile_reports_open_idx on public.profile_reports (created_at desc) where status = 'open';

alter table public.profile_reports enable row level security;
alter table public.profile_reports force row level security;
revoke all on table public.profile_reports from public, anon, authenticated;

-- Reporting the same profile again while the first report is open is a no-op, so the person cannot tell it apart from
-- a new report and cannot flood the queue.
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

revoke execute on function public.report_profile(text, text, text) from public, anon, authenticated;
grant execute on function public.report_profile(text, text, text) to authenticated;

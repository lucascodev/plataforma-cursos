-- History of administrative actions. Rows are written only by the security definer functions that perform the action,
-- and read only through admin_list_audit(). data keeps ids and before/after values, never free text written by people.

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  data jsonb not null default '{}'::jsonb,
  constraint audit_log_action_valid check (action in (
    'proposal.submitted',
    'proposal.approved',
    'proposal.changes_requested',
    'proposal.refused',
    'proposal.withdrawn',
    'role.changed',
    'course.owner_changed',
    'course.listed',
    'course.unlisted',
    'course.deleted'
  )),
  constraint audit_log_target_type_valid check (target_type in ('proposal', 'profile', 'course')),
  constraint audit_log_target_id_length check (char_length(target_id) between 1 and 100),
  constraint audit_log_data_shape check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 2000)
);

comment on table public.audit_log is 'Histórico de ações administrativas. Escrita e leitura só por funções do banco.';

alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;

-- No grants and no policies: nobody reaches this table through the API.
revoke all on table public.audit_log from anon, authenticated, public;

create or replace function public.write_audit(p_action text, p_target_type text, p_target_id text, p_data jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, action, target_type, target_id, data)
  values ((select auth.uid()), p_action, p_target_type, p_target_id, coalesce(p_data, '{}'::jsonb));
end;
$$;

revoke execute on function public.write_audit(text, text, text, jsonb) from public, anon, authenticated;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
end;
$$;

revoke execute on function public.assert_admin() from public, anon, authenticated;

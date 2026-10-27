-- A person can delete their own account. Deleting the auth user cascades to the profile, settings, progress and
-- proposals; the history keeps the action without the person (actor becomes null).
-- Refused while the person owns a course (students would lose it) or is the last admin.

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
  'profile.reported'
));

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role text;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  -- Same lock order as admin_set_role, so a deletion and a demotion cannot leave the platform without admins.
  perform 1 from public.profiles where role = 'admin' for update;
  select role into v_role from public.profiles where id = v_uid for update;
  if exists (select 1 from public.courses c where c.owner_id = v_uid) then
    raise exception using errcode = 'PT409', message = 'owns courses', hint = 'owns-courses';
  end if;
  if v_role = 'admin' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception using errcode = 'PT409', message = 'last admin', hint = 'last-admin';
  end if;

  perform public.write_audit('account.deleted', 'profile', v_uid::text);
  update public.audit_log set actor_id = null where actor_id = v_uid;
  delete from public.rate_limits where subject = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;

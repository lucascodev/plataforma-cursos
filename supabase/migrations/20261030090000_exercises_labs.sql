-- Labs that run outside the platform (GitHub Codespaces or the student's computer) end with a completion code printed by
-- the lab repository's own check script. The code is a digest of the correct output, so the platform needs no signing
-- key and holds no secret at runtime; it is a check in good faith, not anti-cheat.
-- The expected code never goes into the course content: it lives here, readable only by the course owner.

create table if not exists public.course_lab_codes (
  course_slug text not null references public.courses (slug) on update cascade on delete cascade,
  item_key text not null,
  expected_code text not null,
  updated_at timestamptz not null default now(),
  primary key (course_slug, item_key),
  constraint course_lab_codes_item_key_format check (item_key ~ '^[a-z0-9-]{1,60}-t[a-z0-9]{1,12}$'),
  constraint course_lab_codes_code_format check (expected_code ~ '^LAB-[A-Z0-9]{8}$')
);

comment on table public.course_lab_codes is 'Código de conclusão esperado de cada laboratório fora da plataforma. Só a pessoa dona do curso lê.';

create table if not exists public.lab_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null references public.courses (slug) on update cascade on delete cascade,
  item_key text not null,
  verified_at timestamptz not null default now(),
  primary key (user_id, course_slug, item_key)
);

comment on table public.lab_completions is 'Laboratórios que cada pessoa concluiu com o código certo. A pessoa lê as próprias linhas.';

alter table public.course_lab_codes enable row level security;
alter table public.course_lab_codes force row level security;
alter table public.lab_completions enable row level security;
alter table public.lab_completions force row level security;

revoke all on table public.course_lab_codes from public, anon, authenticated;
revoke all on table public.lab_completions from public, anon, authenticated;
grant select on table public.lab_completions to authenticated;

create policy "lab_completions_select_own" on public.lab_completions
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function private.normalize_lab_code(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
$$;

revoke execute on function private.normalize_lab_code(text) from public, anon, authenticated;

-- The teacher registers the code printed by the lab script when it runs against the reference solution.
create or replace function public.teacher_set_lab_code(p_slug text, p_item_key text, p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text := private.normalize_lab_code(p_code);
begin
  perform private.lock_owned_course(p_slug);
  if p_item_key is null or p_item_key !~ '^[a-z0-9-]{1,60}-t[a-z0-9]{1,12}$' then
    raise exception using errcode = 'PT422', message = 'invalid item', hint = 'invalid-lab-item';
  end if;
  if v_code = '' then
    delete from public.course_lab_codes where course_slug = p_slug and item_key = p_item_key;
    return;
  end if;
  if v_code !~ '^LAB-[A-Z0-9]{8}$' then
    raise exception using errcode = 'PT422', message = 'invalid code', hint = 'invalid-lab-code';
  end if;
  insert into public.course_lab_codes (course_slug, item_key, expected_code)
  values (p_slug, p_item_key, v_code)
  on conflict (course_slug, item_key) do update set expected_code = excluded.expected_code, updated_at = now();
end;
$$;

create or replace function public.teacher_list_lab_codes(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
begin
  select * into v_course from public.courses where slug = p_slug;
  if not found or v_course.owner_id is distinct from (select auth.uid()) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  return (
    select coalesce(jsonb_object_agg(item_key, expected_code), '{}'::jsonb)
    from public.course_lab_codes where course_slug = p_slug
  );
end;
$$;

-- Answers only right or wrong. A small limit keeps anyone from guessing codes one after the other.
create or replace function public.verify_lab_code(p_slug text, p_item_key text, p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_expected text;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;
  perform private.assert_not_blocked();
  perform public.consume_rate_limit('lab-verify', 30, interval '10 minutes');
  if not exists (select 1 from public.courses where slug = p_slug and published) then
    raise exception using errcode = 'PT404', message = 'not found', hint = 'course-not-found';
  end if;
  select expected_code into v_expected from public.course_lab_codes where course_slug = p_slug and item_key = p_item_key;
  if v_expected is null then
    raise exception using errcode = 'PT409', message = 'no code', hint = 'lab-code-missing';
  end if;
  if private.normalize_lab_code(p_code) <> v_expected then
    return false;
  end if;
  insert into public.lab_completions (user_id, course_slug, item_key)
  values (v_uid, p_slug, p_item_key)
  on conflict (user_id, course_slug, item_key) do nothing;
  return true;
end;
$$;

revoke execute on function public.teacher_set_lab_code(text, text, text) from public, anon, authenticated;
revoke execute on function public.teacher_list_lab_codes(text) from public, anon, authenticated;
revoke execute on function public.verify_lab_code(text, text, text) from public, anon, authenticated;
grant execute on function public.teacher_set_lab_code(text, text, text) to authenticated;
grant execute on function public.teacher_list_lab_codes(text) to authenticated;
grant execute on function public.verify_lab_code(text, text, text) to authenticated;

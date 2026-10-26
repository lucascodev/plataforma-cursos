-- Each course has an owner (the teacher) and can be taken out of the catalog without being deleted.
-- Writes now happen only through the admin functions, which check the role in profiles and record the action.

alter table public.courses
  add column if not exists owner_id uuid references public.profiles (id) on delete set null,
  add column if not exists listed boolean not null default true;

create index if not exists courses_owner_idx on public.courses (owner_id);

comment on table public.courses is 'Conteúdo publicado dos cursos. Leitura pública dos publicados; escrita só por funções de admin.';
comment on column public.courses.listed is 'false tira o curso do catálogo, mas ele continua abrindo pelo link para quem já estuda.';

drop policy if exists "courses_select_published" on public.courses;
drop policy if exists "courses_insert_admin" on public.courses;
drop policy if exists "courses_update_admin" on public.courses;
drop policy if exists "courses_delete_admin" on public.courses;

revoke insert, update, delete on table public.courses from authenticated;

create policy "courses_select_visible" on public.courses
  for select to anon, authenticated
  using (published or owner_id = (select auth.uid()) or (select public.is_admin()));

-- The owner of a published course has a public profile even before becoming a teacher (e.g. an admin who teaches).
drop policy if exists "profiles_select_self_or_admin" on public.profiles;

create policy "profiles_select_public" on public.profiles
  for select to anon, authenticated
  using (
    id = (select auth.uid())
    or role = 'teacher'
    or (select public.is_admin())
    or exists (select 1 from public.courses c where c.owner_id = profiles.id and c.published)
  );

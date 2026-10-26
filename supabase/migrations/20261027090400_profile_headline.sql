-- Teachers get a professional title (shown next to their name on course pages) and a short bio for cards.
-- The existing bio stays as the long "about" text.

alter table public.profiles
  add column if not exists headline text not null default '',
  add column if not exists short_bio text not null default '';

alter table public.profiles
  add constraint profiles_headline_length check (char_length(headline) <= 80),
  add constraint profiles_short_bio_length check (char_length(short_bio) <= 160);

grant update (headline, short_bio) on table public.profiles to authenticated;

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
    'headline', v_profile.headline,
    'shortBio', v_profile.short_bio,
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

revoke execute on function public.public_teacher_profile(text) from public;
grant execute on function public.public_teacher_profile(text) to anon, authenticated;

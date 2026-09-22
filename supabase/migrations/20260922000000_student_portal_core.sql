-- =========================================================
-- Phase 10: Student Portal Core Migration
-- Enhances student_profiles with public profile attributes
-- Provides safe RPC for profile updates with academic field protection
-- Exposes sanitized public member profile view
-- =========================================================

-- 1. Add headline, bio, and username columns to student_profiles
alter table public.student_profiles
  add column if not exists username text unique check (username is null or username ~ '^[a-z0-9_-]{3,40}$'),
  add column if not exists headline text check (headline is null or length(headline) <= 150),
  add column if not exists bio text check (bio is null or length(bio) <= 1000);

create unique index if not exists student_profiles_username_lower_idx
  on public.student_profiles (lower(username))
  where username is not null;

-- 2. Sanitized Public Member View for Public Portfolio Pages (/member/[username])
create or replace view public.public_member_profiles as
select
  p.id as user_id,
  p.full_name,
  p.role,
  p.membership_status,
  sp.username,
  sp.registration_id,
  sp.register_number,
  sp.department,
  sp.degree_programme,
  sp.year_of_study,
  sp.section,
  sp.batch,
  sp.headline,
  sp.bio,
  sp.github_url,
  sp.linkedin_url,
  sp.portfolio_url,
  sp.created_at
from public.profiles p
join public.student_profiles sp on sp.user_id = p.id
where p.membership_status = 'APPROVED';

revoke all on public.public_member_profiles from public, anon, authenticated;
grant select on public.public_member_profiles to anon, authenticated;

-- 3. Secure RPC for updating student profile links and public bio
-- Protects academic records (register_number, department, year, semester, section, batch)
-- and membership status from client tampering.
create or replace function public.update_student_profile(
  p_headline text default null,
  p_bio text default null,
  p_github_url text default null,
  p_linkedin_url text default null,
  p_portfolio_url text default null,
  p_username text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_trimmed_username text;
  v_updated record;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  -- Ensure student profile exists
  if not exists (select 1 from public.student_profiles where user_id = v_user_id) then
    raise exception 'Student profile not found' using errcode = 'P0002';
  end if;

  -- Validate username if provided
  if p_username is not null and trim(p_username) <> '' then
    v_trimmed_username := lower(trim(p_username));
    if v_trimmed_username !~ '^[a-z0-9_-]{3,40}$' then
      raise exception 'Username must be between 3 and 40 lowercase alphanumeric characters, underscores or hyphens' using errcode = '22000';
    end if;

    if exists (
      select 1 from public.student_profiles
      where lower(username) = v_trimmed_username and user_id <> v_user_id
    ) then
      raise exception 'Username is already taken' using errcode = '23505';
    end if;
  else
    v_trimmed_username := null;
  end if;

  -- Validate URLs if provided
  if p_github_url is not null and trim(p_github_url) <> '' and trim(p_github_url) !~* '^https?://' then
    raise exception 'GitHub URL must start with http:// or https://' using errcode = '22000';
  end if;

  if p_linkedin_url is not null and trim(p_linkedin_url) <> '' and trim(p_linkedin_url) !~* '^https?://' then
    raise exception 'LinkedIn URL must start with http:// or https://' using errcode = '22000';
  end if;

  if p_portfolio_url is not null and trim(p_portfolio_url) <> '' and trim(p_portfolio_url) !~* '^https?://' then
    raise exception 'Portfolio URL must start with http:// or https://' using errcode = '22000';
  end if;

  -- Update only permitted fields
  update public.student_profiles
  set
    headline = nullif(trim(p_headline), ''),
    bio = nullif(trim(p_bio), ''),
    github_url = nullif(trim(p_github_url), ''),
    linkedin_url = nullif(trim(p_linkedin_url), ''),
    portfolio_url = nullif(trim(p_portfolio_url), ''),
    username = case
      when v_trimmed_username is not null then v_trimmed_username
      else username
    end,
    updated_at = now()
  where user_id = v_user_id
  returning * into v_updated;

  return jsonb_build_object(
    'success', true,
    'user_id', v_updated.user_id,
    'username', v_updated.username,
    'headline', v_updated.headline,
    'bio', v_updated.bio,
    'github_url', v_updated.github_url,
    'linkedin_url', v_updated.linkedin_url,
    'portfolio_url', v_updated.portfolio_url
  );
end;
$$;

revoke all on function public.update_student_profile(text, text, text, text, text, text) from public, anon;
grant execute on function public.update_student_profile(text, text, text, text, text, text) to authenticated;

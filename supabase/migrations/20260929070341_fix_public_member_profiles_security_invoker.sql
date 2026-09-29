-- Public member pages are rendered by trusted server-side code. Recreate the
-- view as a deliberately sanitized projection, execute it with the caller's
-- permissions, and keep browser database roles from querying it directly.
drop view public.public_member_profiles;

create view public.public_member_profiles
with (security_invoker = true)
as
select
  p.full_name,
  sp.username,
  null::text as registration_id,
  null::text as register_number,
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

revoke all on public.public_member_profiles from public, anon, authenticated, service_role;
grant select on public.public_member_profiles to service_role;

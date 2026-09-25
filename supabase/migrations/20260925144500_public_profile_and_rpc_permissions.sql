-- The former public view included registration identifiers and ran with its
-- creator's privileges. It is now server-only and obeys the querying role's RLS.
alter view public.public_member_profiles set (security_invoker = true);
revoke all on public.public_member_profiles from public, anon, authenticated;
grant select on public.public_member_profiles to service_role;

-- Neither browser role may invoke administrative helpers or claim the global
-- Sheets queue. The trusted server worker continues to use service_role.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.claim_sheet_sync_jobs(integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_sheet_sync_jobs(integer, integer)
  to service_role;

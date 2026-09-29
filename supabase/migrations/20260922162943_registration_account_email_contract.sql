-- Preserve the legacy two-column storage contract while accepting only the
-- authenticated account email from the registration form.
alter function public.submit_membership_application(jsonb)
  rename to submit_membership_application_legacy_dual_email;

revoke all on function public.submit_membership_application_legacy_dual_email(jsonb)
  from public, anon, authenticated;

create function public.submit_membership_application(payload jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_email text;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'invalid application';
  end if;

  select email into actor_email from auth.users
  where id = (select auth.uid()) and email_confirmed_at is not null;
  if actor_email is null then
    raise exception 'confirmed email required';
  end if;

  return public.submit_membership_application_legacy_dual_email(
    (payload - 'college_email' - 'personal_email') ||
    jsonb_build_object('personal_email', lower(trim(actor_email)))
  );
end;
$$;

revoke all on function public.submit_membership_application(jsonb) from public, anon;
grant execute on function public.submit_membership_application(jsonb) to authenticated;

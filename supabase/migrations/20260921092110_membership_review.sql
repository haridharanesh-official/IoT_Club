-- Membership decisions require a database-controlled administrator role.
-- The function changes application and profile state together and records a
-- minimal audit event. Client roles have no direct update grant on either table.
create function public.review_membership_application(
  application_id uuid,
  decision public.membership_status,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  applicant_id uuid;
  previous_status public.membership_status;
begin
  if actor_id is null or not exists (
    select 1 from public.profiles where id = actor_id and role in ('ADMIN','SUPER_ADMIN')
  ) then raise exception 'not authorized' using errcode = '42501'; end if;
  if application_id is null or decision not in ('APPROVED','REJECTED','SUSPENDED')
    or length(coalesce(notes,'')) > 2000
  then raise exception 'invalid review'; end if;
  if decision in ('REJECTED','SUSPENDED') and nullif(trim(notes), '') is null
  then raise exception 'review notes required'; end if;

  select user_id, status into applicant_id, previous_status
  from public.membership_applications where id = application_id for update;
  if applicant_id is null then raise exception 'application not found'; end if;
  if previous_status = decision then raise exception 'application already has this status'; end if;

  update public.membership_applications
  set status = decision, reviewed_at = now(), reviewed_by = actor_id,
      review_notes = nullif(trim(notes), '')
  where id = application_id;
  update public.profiles set membership_status = decision where id = applicant_id;
  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, previous_data, new_data
  ) values (
    actor_id, 'membership_reviewed', 'membership_application', application_id,
    jsonb_build_object('status', previous_status),
    jsonb_build_object('status', decision)
  );
end;
$$;
revoke all on function public.review_membership_application(uuid, public.membership_status, text) from public, anon;
grant execute on function public.review_membership_application(uuid, public.membership_status, text) to authenticated;

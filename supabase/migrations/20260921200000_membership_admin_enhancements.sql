-- Membership Review RPC enhancements:
-- 1. Explicit transition enforcement:
--    - PENDING -> APPROVED | REJECTED
--    - APPROVED -> SUSPENDED
--    - SUSPENDED -> APPROVED (Reactivation)
--    - REJECTED -> Cannot transition
-- 2. Concurrency row locking with FOR UPDATE
-- 3. Mandatory review notes for REJECTED and SUSPENDED
-- 4. Audit logging with previous and new status
-- 5. Additional index on audit_logs(entity_id)

create or replace function public.review_membership_application(
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
  -- 1. Verify authorization
  if actor_id is null or not exists (
    select 1 from public.profiles where id = actor_id and role in ('ADMIN','SUPER_ADMIN')
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- 2. Input validation
  if application_id is null or decision not in ('APPROVED','REJECTED','SUSPENDED')
    or length(coalesce(notes,'')) > 2000
  then
    raise exception 'invalid review';
  end if;

  -- 3. Review notes requirement
  if decision in ('REJECTED','SUSPENDED') and nullif(trim(notes), '') is null then
    raise exception 'review notes required';
  end if;

  -- 4. Lock application row for concurrency control
  select user_id, status into applicant_id, previous_status
  from public.membership_applications
  where id = application_id
  for update;

  if applicant_id is null then
    raise exception 'application not found';
  end if;

  -- 5. Explicit transition state machine
  if previous_status = decision then
    raise exception 'application already has this status';
  end if;

  if previous_status = 'REJECTED' then
    raise exception 'rejected applications cannot be updated';
  elsif previous_status = 'PENDING' and decision not in ('APPROVED', 'REJECTED') then
    raise exception 'pending applications can only be approved or rejected';
  elsif previous_status = 'APPROVED' and decision not in ('SUSPENDED') then
    raise exception 'approved applications can only be suspended';
  elsif previous_status = 'SUSPENDED' and decision not in ('APPROVED') then
    raise exception 'suspended applications can only be reactivated to approved';
  end if;

  -- 6. Apply state updates
  update public.membership_applications
  set status = decision,
      reviewed_at = now(),
      reviewed_by = actor_id,
      review_notes = nullif(trim(notes), '')
  where id = application_id;

  update public.profiles
  set membership_status = decision
  where id = applicant_id;

  -- 7. Record immutable audit log
  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, previous_data, new_data
  ) values (
    actor_id,
    'membership_reviewed',
    'membership_application',
    application_id,
    jsonb_build_object('status', previous_status),
    jsonb_build_object('status', decision, 'notes', nullif(trim(notes), ''))
  );
end;
$$;

revoke all on function public.review_membership_application(uuid, public.membership_status, text) from public, anon;
grant execute on function public.review_membership_application(uuid, public.membership_status, text) to authenticated;

-- Fast lookup of audit history per application
create index if not exists audit_logs_entity_id_idx on public.audit_logs (entity_id, created_at desc);

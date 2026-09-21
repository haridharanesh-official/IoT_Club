-- Phase 07: Google Sheets outbox trigger and concurrency-safe worker claim RPC
create index if not exists sheet_sync_logs_queue_idx
  on public.sheet_sync_logs (sync_status, updated_at);

create or replace function private.queue_membership_application_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sheet_sync_logs (
    entity_type,
    entity_id,
    operation,
    sync_status,
    updated_at
  )
  values (
    'MEMBERSHIP_APPLICATION',
    new.id,
    'UPSERT',
    'PENDING',
    now()
  )
  on conflict (entity_type, entity_id)
  do update set
    sync_status = 'PENDING',
    updated_at = now();
  return new;
end;
$$;

revoke all on function private.queue_membership_application_sync() from public, anon, authenticated;

drop trigger if exists on_membership_application_changed on public.membership_applications;
create trigger on_membership_application_changed
  after insert or update on public.membership_applications
  for each row
  execute function private.queue_membership_application_sync();

create or replace function public.claim_sheet_sync_jobs(
  batch_size integer default 10,
  stale_minutes integer default 5
)
returns setof public.sheet_sync_logs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with selected as (
    select id
    from public.sheet_sync_logs
    where sync_status = 'PENDING'
       or (sync_status = 'SYNCING' and last_attempt_at < now() - (stale_minutes || ' minutes')::interval)
    order by updated_at asc
    limit batch_size
    for update skip locked
  )
  update public.sheet_sync_logs s
  set sync_status = 'SYNCING',
      last_attempt_at = now(),
      attempt_count = s.attempt_count + 1,
      updated_at = now()
  from selected
  where s.id = selected.id
  returning s.*;
end;
$$;

revoke all on function public.claim_sheet_sync_jobs(integer, integer) from public, anon;
grant execute on function public.claim_sheet_sync_jobs(integer, integer) to authenticated, service_role;

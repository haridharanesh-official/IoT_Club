-- Local reporting-outbox contract only. No Google API or credentials are used.
alter table public.sheet_sync_logs rename column entity to entity_type;
alter table public.sheet_sync_logs add column operation text not null default 'UPSERT'
  check (operation = 'UPSERT');
alter table public.sheet_sync_logs drop constraint sheet_sync_logs_sync_status_check;
alter table public.sheet_sync_logs add constraint sheet_sync_logs_sync_status_check
  check (sync_status in ('PENDING','SYNCING','SYNCED','FAILED'));
alter table public.sheet_sync_logs add constraint sheet_sync_logs_entity_type_check
  check (entity_type = 'MEMBERSHIP_APPLICATION');

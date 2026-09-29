-- The registration form no longer collects a reason for joining. Keep the
-- legacy column for historical rows, but allow new applications to leave it
-- empty and remove the legacy RPC's obsolete required-field check.
alter table public.membership_applications
  alter column reason_for_joining drop not null;

alter table public.student_interests
  drop constraint student_interests_interest_check;

alter table public.student_interests
  add constraint student_interests_interest_check check (interest in (
    'Internet of Things',
    'Embedded Systems',
    'Microcontrollers',
    'Sensors & Actuators',
    'IoT Communication Protocols',
    'Wireless IoT',
    'LoRa / LoRaWAN',
    'MQTT',
    'Edge IoT',
    'Industrial IoT',
    'IoT Cloud & Dashboards',
    'IoT Security',
    'Smart Home & Building Automation',
    'Smart Agriculture IoT',
    'Healthcare IoT'
  )) not valid;

do $$
declare
  function_definition text;
  updated_definition text;
begin
  if to_regprocedure(
    'public.submit_membership_application_legacy_dual_email(jsonb)'
  ) is null then
    return;
  end if;

  select pg_get_functiondef(
    'public.submit_membership_application_legacy_dual_email(jsonb)'::regprocedure
  ) into function_definition;

  updated_definition := replace(
    function_definition,
    E'    or nullif(trim(payload->>\'reason_for_joining\'), \'\') is null\n    or length(payload->>\'reason_for_joining\') > 2000\n',
    E'    or length(payload->>\'reason_for_joining\') > 2000\n'
  );

  updated_definition := replace(
    updated_definition,
    E'actor_id, registration_id, trim(payload->>\'reason_for_joining\'), skill_level,',
    E'actor_id, registration_id, nullif(trim(payload->>\'reason_for_joining\'), \'\'), skill_level,'
  );

  if updated_definition = function_definition then
    raise exception 'legacy registration function did not contain the expected reason_for_joining contract';
  end if;

  execute updated_definition;
end;
$$;

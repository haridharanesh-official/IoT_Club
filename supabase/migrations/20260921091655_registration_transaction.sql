-- A single privileged transaction is required because the browser has no
-- write access to protected role, membership, or audit columns. All identity
-- and status values are taken from Auth/database state, never request JSON.
create function public.submit_membership_application(payload jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email text;
  registration_id text;
  interest text;
  skill_item jsonb;
  skill_category public.skill_category;
  skill_name text;
  skill_level public.skill_level;
  birth_date date;
  study_year integer;
  study_semester integer;
begin
  if actor_id is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'invalid application'; end if;

  select email into actor_email from auth.users
  where id = actor_id and email_confirmed_at is not null;
  if actor_email is null then raise exception 'confirmed email required'; end if;

  if not exists (select 1 from public.profiles where id = actor_id and role = 'STUDENT' and membership_status = 'PENDING') then
    raise exception 'registration unavailable';
  end if;
  if exists (select 1 from public.membership_applications where user_id = actor_id) then
    raise exception 'application already submitted' using errcode = '23505';
  end if;

  if nullif(trim(payload->>'full_name'), '') is null or length(payload->>'full_name') > 160
    or nullif(trim(payload->>'mobile_number'), '') is null
    or (payload->>'mobile_number') !~ '^[0-9+() -]{7,20}$'
    or nullif(trim(payload->>'personal_email'), '') is null
    or length(payload->>'personal_email') > 254
    or (payload->>'personal_email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or nullif(trim(payload->>'register_number'), '') is null
    or length(payload->>'register_number') > 40
    or nullif(trim(payload->>'department'), '') is null or length(payload->>'department') > 120
    or nullif(trim(payload->>'degree_programme'), '') is null or length(payload->>'degree_programme') > 120
    or nullif(trim(payload->>'batch'), '') is null or length(payload->>'batch') > 30
    or nullif(trim(payload->>'reason_for_joining'), '') is null
    or length(payload->>'reason_for_joining') > 2000
    or payload->>'consent_accuracy' <> 'true'
    or payload->>'consent_rules' <> 'true'
    or payload->>'consent_data_use' <> 'true'
  then raise exception 'invalid application'; end if;

  begin
    birth_date := (payload->>'date_of_birth')::date;
    study_year := (payload->>'year_of_study')::integer;
    study_semester := (payload->>'semester')::integer;
    skill_level := (payload->>'skill_level')::public.skill_level;
  exception when others then raise exception 'invalid application'; end;
  if birth_date is null or birth_date > current_date or birth_date < date '1900-01-01'
    or study_year is null or study_year not between 1 and 6
    or study_semester is null or study_semester not between 1 and 12
    or skill_level is null
    or payload->>'previous_iot_experience' is null
    or payload->>'previous_iot_experience' not in ('true','false')
    or (payload->>'previous_iot_experience' = 'true' and nullif(trim(payload->>'experience_description'), '') is null)
  then raise exception 'invalid application'; end if;

  if payload->'interests' is null or jsonb_typeof(payload->'interests') <> 'array'
    or jsonb_array_length(payload->'interests') = 0
    or jsonb_array_length(payload->'interests') > 10
    or (payload ? 'skills' and (jsonb_typeof(payload->'skills') <> 'array' or jsonb_array_length(payload->'skills') > 30))
  then raise exception 'invalid application'; end if;

  registration_id := 'IOT-' || extract(year from current_date)::text || '-'
    || lpad(nextval('public.registration_number_seq')::text, 5, '0');

  update public.profiles set full_name = trim(payload->>'full_name') where id = actor_id;
  insert into public.student_profiles (
    user_id, registration_id, date_of_birth, gender, mobile_number, personal_email,
    college_email, register_number, department, degree_programme, year_of_study,
    semester, section, batch, github_url, linkedin_url, portfolio_url
  ) values (
    actor_id, registration_id, birth_date, nullif(trim(payload->>'gender'), ''),
    trim(payload->>'mobile_number'), lower(trim(payload->>'personal_email')),
    actor_email, trim(payload->>'register_number'), trim(payload->>'department'),
    trim(payload->>'degree_programme'), study_year, study_semester,
    nullif(trim(payload->>'section'), ''), trim(payload->>'batch'),
    nullif(trim(payload->>'github_url'), ''), nullif(trim(payload->>'linkedin_url'), ''),
    nullif(trim(payload->>'portfolio_url'), '')
  );

  insert into public.membership_applications (
    user_id, registration_id, reason_for_joining, skill_level,
    previous_iot_experience, experience_description
  ) values (
    actor_id, registration_id, trim(payload->>'reason_for_joining'), skill_level,
    (payload->>'previous_iot_experience')::boolean,
    nullif(trim(payload->>'experience_description'), '')
  );

  for interest in select value from jsonb_array_elements_text(payload->'interests') loop
    insert into public.student_interests (user_id, interest) values (actor_id, interest);
  end loop;
  for skill_item in select value from jsonb_array_elements(coalesce(payload->'skills', '[]'::jsonb)) loop
    skill_category := (skill_item->>'category')::public.skill_category;
    skill_name := skill_item->>'skill';
    insert into public.student_skills (user_id, category, skill, level)
    values (actor_id, skill_category, skill_name, (skill_item->>'level')::public.skill_level);
  end loop;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
  values (actor_id, 'membership_application_submitted', 'membership_application', actor_id,
    jsonb_build_object('registration_id', registration_id, 'status', 'PENDING'));
  return registration_id;
end;
$$;

revoke all on function public.submit_membership_application(jsonb) from public, anon;
grant execute on function public.submit_membership_application(jsonb) to authenticated;

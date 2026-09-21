-- Seed data for local testing and deterministic reset

-- 1. Test Admin Account: test.admin@college.example (Password: TestPassword123!)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '3e96bf7d-2f0b-46af-8da2-b77f576b18a8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.admin@college.example',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Admin","email":"test.admin@college.example"}',
  now(),
  now(),
  '', '', '', ''
) on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at;

update public.profiles
set role = 'ADMIN',
    membership_status = 'APPROVED',
    full_name = 'Test Admin'
where id = '3e96bf7d-2f0b-46af-8da2-b77f576b18a8';

-- 2. Preserved Known Fixture: IOT-2026-00008 (Approved Test Student, APPROVED)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  'c4a6963f-48e4-4f99-8ceb-1d15030a1974',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'approved.student@college.example',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Approved Test Student","full_name":"Approved Test Student","email":"approved.student@college.example"}',
  now(),
  now(),
  '', '', '', ''
) on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at;

update public.profiles
set role = 'STUDENT',
    membership_status = 'APPROVED',
    full_name = 'Approved Test Student'
where id = 'c4a6963f-48e4-4f99-8ceb-1d15030a1974';

insert into public.student_profiles (
  user_id, registration_id, date_of_birth, gender, mobile_number,
  personal_email, college_email, register_number, department,
  degree_programme, year_of_study, semester, section, batch,
  github_url, linkedin_url, portfolio_url
) values (
  'c4a6963f-48e4-4f99-8ceb-1d15030a1974',
  'IOT-2026-00008',
  '2005-01-01',
  'Male',
  '9000000008',
  'approved.student@example.com',
  'approved.student@college.example',
  'TEST-IOT-00008',
  'Cyber Security',
  'BE',
  2,
  3,
  'A',
  '2025-2029',
  null,
  null,
  null
) on conflict (user_id) do nothing;

insert into public.membership_applications (
  id, user_id, registration_id, reason_for_joining, skill_level,
  previous_iot_experience, experience_description, status,
  submitted_at, reviewed_at, reviewed_by, review_notes,
  consented_accuracy_at, consented_rules_at, consented_data_use_at
) values (
  '73e5e408-978d-48b8-8796-663617c6aeb0',
  'c4a6963f-48e4-4f99-8ceb-1d15030a1974',
  'IOT-2026-00008',
  'Dedicated to embedded systems and IoT architecture.',
  'BEGINNER',
  false,
  null,
  'APPROVED',
  now() - interval '2 days',
  now() - interval '1 day',
  '3e96bf7d-2f0b-46af-8da2-b77f576b18a8',
  'Approved synthetic test fixture',
  now() - interval '2 days',
  now() - interval '2 days',
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into public.student_interests (user_id, interest)
values
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'Internet of Things'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'Robotics'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'Cybersecurity')
on conflict (user_id, interest) do nothing;

insert into public.student_skills (user_id, category, skill, level)
values
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'PROGRAMMING', 'C++', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'PROGRAMMING', 'Python', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'HARDWARE', 'ESP32', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'HARDWARE', 'ESP8266', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'TECHNOLOGY', 'Home Assistant', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'TECHNOLOGY', 'MQTT', 'BEGINNER'),
  ('c4a6963f-48e4-4f99-8ceb-1d15030a1974', 'TECHNOLOGY', 'Git / GitHub', 'BEGINNER')
on conflict (user_id, category, skill) do nothing;

update public.sheet_sync_logs
set sync_status = 'SYNCED',
    attempt_count = 1,
    last_attempt_at = now() - interval '1 day',
    synced_at = now() - interval '1 day'
where entity_type = 'MEMBERSHIP_APPLICATION'
  and entity_id = '73e5e408-978d-48b8-8796-663617c6aeb0';

-- 3. Synthetic Fixtures for Admin Testing:
-- PENDING: IOT-2026-00010 (Pending Test Student)
-- REJECTED: IOT-2026-00011 (Rejected Test Student)
-- SUSPENDED: IOT-2026-00012 (Suspended Test Student)

-- 3A. PENDING
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  'e1111111-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pending.student@college.example',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pending Test Student","email":"pending.student@college.example"}',
  now(),
  now(),
  '', '', '', ''
) on conflict (id) do nothing;

update public.profiles
set role = 'STUDENT',
    membership_status = 'PENDING',
    full_name = 'Pending Test Student'
where id = 'e1111111-1111-4111-8111-111111111111';

insert into public.student_profiles (
  user_id, registration_id, date_of_birth, gender, mobile_number,
  personal_email, college_email, register_number, department,
  degree_programme, year_of_study, semester, section, batch,
  github_url, linkedin_url, portfolio_url
) values (
  'e1111111-1111-4111-8111-111111111111',
  'IOT-2026-00010',
  '2006-01-01',
  'Female',
  '9000000010',
  'pending.student@example.com',
  'pending.student@college.example',
  'TEST-IOT-00010',
  'Electronics and Communication Engineering',
  'BE',
  3,
  5,
  'B',
  '2024-2028',
  null,
  null,
  null
) on conflict (user_id) do nothing;

insert into public.membership_applications (
  id, user_id, registration_id, reason_for_joining, skill_level,
  previous_iot_experience, experience_description, status,
  submitted_at,
  consented_accuracy_at, consented_rules_at, consented_data_use_at
) values (
  'a1111111-1111-4111-8111-111111111111',
  'e1111111-1111-4111-8111-111111111111',
  'IOT-2026-00010',
  'Passionate about edge sensors and smart embedded circuits.',
  'INTERMEDIATE',
  true,
  'Built an ambient telemetry station with Arduino and LoRa.',
  'PENDING',
  now() - interval '3 hours',
  now() - interval '3 hours',
  now() - interval '3 hours',
  now() - interval '3 hours'
) on conflict (id) do nothing;

insert into public.student_interests (user_id, interest)
values
  ('e1111111-1111-4111-8111-111111111111', 'Internet of Things'),
  ('e1111111-1111-4111-8111-111111111111', 'Embedded Systems'),
  ('e1111111-1111-4111-8111-111111111111', 'Electronics')
on conflict (user_id, interest) do nothing;

insert into public.student_skills (user_id, category, skill, level)
values
  ('e1111111-1111-4111-8111-111111111111', 'PROGRAMMING', 'C++', 'INTERMEDIATE'),
  ('e1111111-1111-4111-8111-111111111111', 'HARDWARE', 'Arduino', 'INTERMEDIATE'),
  ('e1111111-1111-4111-8111-111111111111', 'TECHNOLOGY', 'MQTT', 'BEGINNER')
on conflict (user_id, category, skill) do nothing;

update public.sheet_sync_logs
set sync_status = 'PENDING',
    attempt_count = 0
where entity_type = 'MEMBERSHIP_APPLICATION'
  and entity_id = 'a1111111-1111-4111-8111-111111111111';

-- 3B. REJECTED
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  'e2222222-2222-4222-8222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rejected.student@college.example',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Rejected Test Student","email":"rejected.student@college.example"}',
  now(),
  now(),
  '', '', '', ''
) on conflict (id) do nothing;

update public.profiles
set role = 'STUDENT',
    membership_status = 'REJECTED',
    full_name = 'Rejected Test Student'
where id = 'e2222222-2222-4222-8222-222222222222';

insert into public.student_profiles (
  user_id, registration_id, date_of_birth, gender, mobile_number,
  personal_email, college_email, register_number, department,
  degree_programme, year_of_study, semester, section, batch,
  github_url, linkedin_url, portfolio_url
) values (
  'e2222222-2222-4222-8222-222222222222',
  'IOT-2026-00011',
  '2005-01-01',
  'Male',
  '9000000011',
  'rejected.student@example.com',
  'rejected.student@college.example',
  'TEST-IOT-00011',
  'Mechanical Engineering',
  'BE',
  4,
  7,
  'A',
  '2023-2027',
  null,
  null,
  null
) on conflict (user_id) do nothing;

insert into public.membership_applications (
  id, user_id, registration_id, reason_for_joining, skill_level,
  previous_iot_experience, experience_description, status,
  submitted_at, reviewed_at, reviewed_by, review_notes,
  consented_accuracy_at, consented_rules_at, consented_data_use_at
) values (
  'a2222222-2222-4222-8222-222222222222',
  'e2222222-2222-4222-8222-222222222222',
  'IOT-2026-00011',
  'Want to explore robotics.',
  'BEGINNER',
  false,
  null,
  'REJECTED',
  now() - interval '5 days',
  now() - interval '4 days',
  '3e96bf7d-2f0b-46af-8da2-b77f576b18a8',
  'Incomplete statement of technical interest and prerequisite coursework.',
  now() - interval '5 days',
  now() - interval '5 days',
  now() - interval '5 days'
) on conflict (id) do nothing;

update public.sheet_sync_logs
set sync_status = 'SYNCED',
    attempt_count = 1,
    last_attempt_at = now() - interval '4 days',
    synced_at = now() - interval '4 days'
where entity_type = 'MEMBERSHIP_APPLICATION'
  and entity_id = 'a2222222-2222-4222-8222-222222222222';

-- 3C. SUSPENDED
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  'e3333333-3333-4333-8333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'suspended.student@college.example',
  extensions.crypt('TestPassword123!', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Suspended Test Student","email":"suspended.student@college.example"}',
  now(),
  now(),
  '', '', '', ''
) on conflict (id) do nothing;

update public.profiles
set role = 'STUDENT',
    membership_status = 'SUSPENDED',
    full_name = 'Suspended Test Student'
where id = 'e3333333-3333-4333-8333-333333333333';

insert into public.student_profiles (
  user_id, registration_id, date_of_birth, gender, mobile_number,
  personal_email, college_email, register_number, department,
  degree_programme, year_of_study, semester, section, batch,
  github_url, linkedin_url, portfolio_url
) values (
  'e3333333-3333-4333-8333-333333333333',
  'IOT-2026-00012',
  '2006-01-01',
  'Female',
  '9000000012',
  'suspended.student@example.com',
  'suspended.student@college.example',
  'TEST-IOT-00012',
  'Computer Science and Engineering',
  'BE',
  3,
  5,
  'A',
  '2024-2028',
  null,
  null,
  null
) on conflict (user_id) do nothing;

insert into public.membership_applications (
  id, user_id, registration_id, reason_for_joining, skill_level,
  previous_iot_experience, experience_description, status,
  submitted_at, reviewed_at, reviewed_by, review_notes,
  consented_accuracy_at, consented_rules_at, consented_data_use_at
) values (
  'a3333333-3333-4333-8333-333333333333',
  'e3333333-3333-4333-8333-333333333333',
  'IOT-2026-00012',
  'Developing cloud IoT dashboard.',
  'ADVANCED',
  true,
  'Built Node.js MQTT broker cluster with Grafana.',
  'SUSPENDED',
  now() - interval '10 days',
  now() - interval '2 days',
  '3e96bf7d-2f0b-46af-8da2-b77f576b18a8',
  'Suspended pending hardware asset return from semester project.',
  now() - interval '10 days',
  now() - interval '10 days',
  now() - interval '10 days'
) on conflict (id) do nothing;

update public.sheet_sync_logs
set sync_status = 'SYNCED',
    attempt_count = 1,
    last_attempt_at = now() - interval '2 days',
    synced_at = now() - interval '2 days'
where entity_type = 'MEMBERSHIP_APPLICATION'
  and entity_id = 'a3333333-3333-4333-8333-333333333333';

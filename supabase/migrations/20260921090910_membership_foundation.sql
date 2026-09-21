create type public.app_role as enum ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN');
create type public.membership_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
create type public.skill_level as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
create type public.skill_category as enum ('PROGRAMMING', 'HARDWARE', 'TECHNOLOGY');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'STUDENT',
  membership_status public.membership_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  registration_id text unique,
  date_of_birth date,
  gender text check (gender is null or length(gender) <= 40),
  mobile_number text check (mobile_number is null or mobile_number ~ '^[0-9+() -]{7,20}$'),
  personal_email text,
  college_email text,
  register_number text unique,
  department text,
  degree_programme text,
  year_of_study integer check (year_of_study between 1 and 6),
  semester integer check (semester between 1 and 12),
  section text,
  batch text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  registration_id text not null unique,
  reason_for_joining text not null,
  skill_level public.skill_level not null,
  previous_iot_experience boolean not null,
  experience_description text,
  status public.membership_status not null default 'PENDING',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_description_required check (not previous_iot_experience or nullif(trim(experience_description), '') is not null)
);

create table public.student_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest text not null check (interest in (
    'Internet of Things', 'Embedded Systems', 'Robotics', 'Cybersecurity',
    'Artificial Intelligence', 'Edge AI', 'Automation', 'Electronics',
    'Cloud & Networking', 'Computer Vision'
  )),
  created_at timestamptz not null default now(),
  unique (user_id, interest)
);

create table public.student_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category public.skill_category not null,
  skill text not null,
  level public.skill_level not null,
  created_at timestamptz not null default now(),
  unique (user_id, category, skill),
  constraint skill_matches_category check (
    (category = 'PROGRAMMING' and skill in ('C', 'C++', 'Python', 'Java', 'JavaScript')) or
    (category = 'HARDWARE' and skill in ('Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi', 'STM32')) or
    (category = 'TECHNOLOGY' and skill in ('MQTT', 'Node-RED', 'Home Assistant', 'Linux', 'Git / GitHub', 'Cloud', 'Networking'))
  )
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create sequence public.registration_number_seq;

create function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger student_profiles_updated_at before update on public.student_profiles
for each row execute function private.set_updated_at();
create trigger membership_applications_updated_at before update on public.membership_applications
for each row execute function private.set_updated_at();

-- The Auth trigger must write a profile before any application exists. It has
-- no client grant, uses a fixed search path, and never reads user role metadata.
create function private.create_auth_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;
revoke all on function private.create_auth_profile() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.create_auth_profile();

-- Role lookup is isolated from RLS recursion on profiles. It can only answer
-- whether the current authenticated user has a database-controlled role.
create function private.has_role(required_roles public.app_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = any(required_roles)
  );
$$;
revoke all on function private.has_role(public.app_role[]) from public, anon;
grant execute on function private.has_role(public.app_role[]) to authenticated;

create index membership_applications_status_submitted_idx on public.membership_applications (status, submitted_at desc);
create index membership_applications_reviewed_by_idx on public.membership_applications (reviewed_by);
create index student_interests_user_idx on public.student_interests (user_id);
create index student_skills_user_idx on public.student_skills (user_id);
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.membership_applications enable row level security;
alter table public.student_interests enable row level security;
alter table public.student_skills enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.profiles, public.student_profiles, public.membership_applications,
  public.student_interests, public.student_skills, public.audit_logs from anon, authenticated;
grant select on public.profiles, public.student_profiles, public.membership_applications,
  public.student_interests, public.student_skills, public.audit_logs to authenticated;

create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy student_profiles_read on public.student_profiles for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy membership_applications_read on public.membership_applications for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy student_interests_read on public.student_interests for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy student_skills_read on public.student_skills for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy audit_logs_read on public.audit_logs for select to authenticated
using ((select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));

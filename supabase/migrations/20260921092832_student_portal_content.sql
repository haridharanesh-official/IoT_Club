-- Student-facing content and operational records. All public tables use RLS;
-- student access is tied to the verified database membership state.
create function private.is_active_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and ((role = 'STUDENT' and membership_status = 'APPROVED')
        or role in ('TEACHER','ADMIN','SUPER_ADMIN'))
  );
$$;
revoke all on function private.is_active_member() from public, anon;
grant execute on function private.is_active_member() to authenticated;

create table public.teacher_assignments (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (teacher_id, student_id),
  check (teacher_id <> student_id)
);
create index teacher_assignments_student_idx on public.teacher_assignments (student_id);

create function private.is_assigned_teacher(student_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.teacher_assignments a
    join public.profiles p on p.id = a.teacher_id
    where a.student_id = $1 and a.teacher_id = (select auth.uid()) and p.role = 'TEACHER'
  );
$$;
revoke all on function private.is_assigned_teacher(uuid) from public, anon;
grant execute on function private.is_assigned_teacher(uuid) to authenticated;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(title) between 1 and 180),
  description text,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (length(title) between 1 and 180),
  description text,
  position integer not null check (position > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);
create index learning_modules_course_idx on public.learning_modules (course_id);
create table public.student_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  score numeric(5,2) check (score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, module_id)
);
create index student_progress_module_idx on public.student_progress (module_id);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  provider text not null check (length(provider) between 1 and 120),
  description text,
  registration_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.student_certifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  certification_id uuid not null references public.certifications(id) on delete cascade,
  status text not null default 'REGISTERED' check (status in ('REGISTERED','IN_PROGRESS','COMPLETED')),
  certificate_url text,
  verification_status text not null default 'PENDING' check (verification_status in ('PENDING','VERIFIED','REJECTED')),
  verified_by uuid references public.profiles(id),
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, certification_id)
);
create index student_certifications_cert_idx on public.student_certifications (certification_id);
create index student_certifications_verifier_idx on public.student_certifications (verified_by);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('PRESENT','ABSENT','EXCUSED')),
  method text not null check (method in ('MANUAL','RFID','QR','NFC')),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, student_id)
);
create index attendance_records_student_idx on public.attendance_records (student_id, recorded_at desc);
create index attendance_records_recorder_idx on public.attendance_records (recorded_by);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  description text,
  owner_id uuid not null references public.profiles(id),
  mentor_id uuid references public.profiles(id),
  status text not null default 'PROPOSED' check (status in ('PROPOSED','ACTIVE','COMPLETED','ARCHIVED')),
  github_url text,
  starts_on date,
  completed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_on is null or starts_on is null or completed_on >= starts_on)
);
create index projects_owner_idx on public.projects (owner_id);
create index projects_mentor_idx on public.projects (mentor_id);
create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, student_id)
);
create index project_members_student_idx on public.project_members (student_id);

-- These narrow helpers break the project/member policy cycle without granting
-- either table broad read access to students.
create function private.is_project_member(target_project_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.project_members
    where project_id = $1 and student_id = (select auth.uid()));
$$;
revoke all on function private.is_project_member(uuid) from public, anon;
grant execute on function private.is_project_member(uuid) to authenticated;
create function private.is_project_lead(target_project_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.projects
    where id = $1 and (owner_id = (select auth.uid()) or mentor_id = (select auth.uid())));
$$;
revoke all on function private.is_project_lead(uuid) from public, anon;
grant execute on function private.is_project_lead(uuid) to authenticated;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  published boolean not null default false,
  capacity integer check (capacity is null or capacity > 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create table public.event_registrations (
  event_id uuid not null references public.events(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  attendance_record_id uuid references public.attendance_records(id),
  primary key (event_id, student_id)
);
create index event_registrations_student_idx on public.event_registrations (student_id);
create index event_registrations_attendance_idx on public.event_registrations (attendance_record_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(title) between 1 and 180),
  message text not null,
  type text not null check (type in ('INFO','SUCCESS','WARNING','ACTION')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  message text not null,
  audience text not null check (audience in ('ALL','STUDENT','TEACHER','ADMIN')),
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index announcements_published_idx on public.announcements (published, published_at desc);

create table public.sheet_sync_logs (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id uuid not null,
  sync_status text not null default 'PENDING' check (sync_status in ('PENDING','SYNCED','FAILED')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  synced_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity, entity_id)
);
create index sheet_sync_logs_status_idx on public.sheet_sync_logs (sync_status, last_attempt_at);

create trigger courses_updated_at before update on public.courses for each row execute function private.set_updated_at();
create trigger learning_modules_updated_at before update on public.learning_modules for each row execute function private.set_updated_at();
create trigger student_progress_updated_at before update on public.student_progress for each row execute function private.set_updated_at();
create trigger certifications_updated_at before update on public.certifications for each row execute function private.set_updated_at();
create trigger student_certifications_updated_at before update on public.student_certifications for each row execute function private.set_updated_at();
create trigger attendance_records_updated_at before update on public.attendance_records for each row execute function private.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function private.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function private.set_updated_at();
create trigger announcements_updated_at before update on public.announcements for each row execute function private.set_updated_at();
create trigger sheet_sync_logs_updated_at before update on public.sheet_sync_logs for each row execute function private.set_updated_at();

alter table public.teacher_assignments enable row level security;
alter table public.courses enable row level security;
alter table public.learning_modules enable row level security;
alter table public.student_progress enable row level security;
alter table public.certifications enable row level security;
alter table public.student_certifications enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.sheet_sync_logs enable row level security;

revoke all on public.teacher_assignments, public.courses, public.learning_modules,
  public.student_progress, public.certifications, public.student_certifications,
  public.attendance_sessions, public.attendance_records, public.projects,
  public.project_members, public.events, public.event_registrations,
  public.notifications, public.announcements, public.sheet_sync_logs
  from anon, authenticated;
grant select on public.teacher_assignments, public.courses, public.learning_modules,
  public.student_progress, public.certifications, public.student_certifications,
  public.attendance_sessions, public.attendance_records, public.projects,
  public.project_members, public.events, public.event_registrations,
  public.notifications, public.announcements to authenticated;
grant select on public.sheet_sync_logs to authenticated;

create policy teacher_assignments_read on public.teacher_assignments for select to authenticated
using (teacher_id = (select auth.uid()) or student_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy courses_read on public.courses for select to authenticated
using ((published and (select private.is_active_member())) or (select private.has_role(array['TEACHER','ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy learning_modules_read on public.learning_modules for select to authenticated
using ((published and exists (select 1 from public.courses c where c.id = course_id and c.published) and (select private.is_active_member())) or (select private.has_role(array['TEACHER','ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy student_progress_read on public.student_progress for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_assigned_teacher(student_id)) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy certifications_read on public.certifications for select to authenticated
using ((published and (select private.is_active_member())) or (select private.has_role(array['TEACHER','ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy student_certifications_read on public.student_certifications for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_assigned_teacher(student_id)) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy attendance_sessions_read on public.attendance_sessions for select to authenticated
using ((select private.is_active_member()));
create policy attendance_records_read on public.attendance_records for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_assigned_teacher(student_id)) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy projects_read on public.projects for select to authenticated
using ((select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])) or owner_id = (select auth.uid()) or mentor_id = (select auth.uid()) or (select private.is_project_member(id)));
create policy project_members_read on public.project_members for select to authenticated
using (student_id = (select auth.uid()) or (select private.is_project_lead(project_id)) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy events_read on public.events for select to authenticated
using ((published and (select private.is_active_member())) or (select private.has_role(array['TEACHER','ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy event_registrations_read on public.event_registrations for select to authenticated
using (student_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy notifications_read on public.notifications for select to authenticated
using (user_id = (select auth.uid()) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy announcements_read on public.announcements for select to authenticated
using ((published and (audience = 'ALL' or audience = (select role::text from public.profiles where id = (select auth.uid()))) and (select private.is_active_member())) or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
create policy sheet_sync_logs_read on public.sheet_sync_logs for select to authenticated
using ((select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));

-- Faculty may see only explicitly assigned students and their learning data.
drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_assigned_teacher(id))
  or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
drop policy student_profiles_read on public.student_profiles;
create policy student_profiles_read on public.student_profiles for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_assigned_teacher(user_id))
  or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
drop policy student_interests_read on public.student_interests;
create policy student_interests_read on public.student_interests for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_assigned_teacher(user_id))
  or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));
drop policy student_skills_read on public.student_skills;
create policy student_skills_read on public.student_skills for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_assigned_teacher(user_id))
  or (select private.has_role(array['ADMIN','SUPER_ADMIN']::public.app_role[])));

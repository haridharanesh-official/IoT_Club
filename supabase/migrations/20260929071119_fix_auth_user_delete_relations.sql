-- Auth user deletion cascades through profiles. User-owned records should be
-- removed with that profile, while historical authorship/review references
-- must survive with a null actor.

alter table public.membership_applications
  drop constraint membership_applications_reviewed_by_fkey,
  add constraint membership_applications_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.audit_logs
  drop constraint audit_logs_actor_user_id_fkey,
  add constraint audit_logs_actor_user_id_fkey
    foreign key (actor_user_id) references public.profiles(id) on delete set null;

alter table public.courses
  drop constraint courses_created_by_fkey,
  add constraint courses_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.attendance_sessions
  drop constraint attendance_sessions_created_by_fkey,
  add constraint attendance_sessions_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.events
  drop constraint events_created_by_fkey,
  add constraint events_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.projects
  drop constraint projects_mentor_id_fkey,
  add constraint projects_mentor_id_fkey
    foreign key (mentor_id) references public.profiles(id) on delete set null,
  drop constraint projects_owner_id_fkey,
  add constraint projects_owner_id_fkey
    foreign key (owner_id) references public.profiles(id) on delete cascade;

alter table public.student_certifications
  drop constraint student_certifications_verified_by_fkey,
  add constraint student_certifications_verified_by_fkey
    foreign key (verified_by) references public.profiles(id) on delete set null;

-- These are historical actor columns. Make them nullable so SET NULL can
-- preserve the records after the account is removed.
alter table public.announcements alter column created_by drop not null;
alter table public.announcements
  drop constraint announcements_created_by_fkey,
  add constraint announcements_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.attendance_records alter column recorded_by drop not null;
alter table public.attendance_records
  drop constraint attendance_records_recorded_by_fkey,
  add constraint attendance_records_recorded_by_fkey
    foreign key (recorded_by) references public.profiles(id) on delete set null;

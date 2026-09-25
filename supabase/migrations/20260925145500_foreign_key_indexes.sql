-- Cover foreign-key columns reported by the Supabase performance advisor.
-- These are additive, non-destructive indexes and can be removed separately if future
-- workload evidence shows they are unnecessary.

create index if not exists announcements_created_by_idx
  on public.announcements(created_by);

create index if not exists attendance_sessions_created_by_idx
  on public.attendance_sessions(created_by);

create index if not exists courses_created_by_idx
  on public.courses(created_by);

create index if not exists events_created_by_idx
  on public.events(created_by);

# Registrations sheet contract (local design only)

Supabase PostgreSQL is the source of truth. A future server-side worker may mirror
approved registration fields to a `Registrations` sheet. This document does not
configure Google or authorize an export.

| Column | Sheet heading | Database source / transformation |
|---|---|---|
| A | Registration ID | `student_profiles.registration_id` |
| B | Register Number | `student_profiles.register_number` |
| C | Full Name | `profiles.full_name` |
| D | Department | `student_profiles.department` |
| E | Degree / Programme | `student_profiles.degree_programme` |
| F | Year | `student_profiles.year_of_study` |
| G | Semester | `student_profiles.semester` |
| H | Section | `student_profiles.section` |
| I | Batch | `student_profiles.batch` |
| J | Mobile Number | `student_profiles.mobile_number` |
| K | College Email | `student_profiles.college_email` |
| L | Personal Email | `student_profiles.personal_email` |
| M | Gender | `student_profiles.gender` |
| N | Areas of Interest | `student_interests.interest`, sorted and joined with `, ` |
| O | Skill Level | `membership_applications.skill_level` |
| P | Previous IoT Experience | `membership_applications.previous_iot_experience` as Yes/No |
| Q | Programming Skills | `student_skills.skill` where `category = PROGRAMMING`, sorted and joined |
| R | Hardware Skills | `student_skills.skill` where `category = HARDWARE`, sorted and joined |
| S | Technology Skills | `student_skills.skill` where `category = TECHNOLOGY`, sorted and joined |
| T | GitHub | `student_profiles.github_url` |
| U | LinkedIn | `student_profiles.linkedin_url` |
| V | Portfolio | `student_profiles.portfolio_url` |
| W | Membership Status | `membership_applications.status` |
| X | Submitted At | `membership_applications.submitted_at`, ISO 8601 UTC |
| Y | Reviewed At | `membership_applications.reviewed_at`, ISO 8601 UTC or blank |
| Z | Reviewed By | `membership_applications.reviewed_by` joined to reviewer `profiles.full_name`; use reviewer email if the name is blank |
| AA | Review Notes | `membership_applications.review_notes` |
| AB | Last Synced At | `sheet_sync_logs.synced_at`, ISO 8601 UTC or blank |

The database query must join the single application to its profile and student
profile by `user_id`, aggregate interests and skills by that same ID, and join
the reviewer separately by `reviewed_by`. The worker must authorize its
server-side database access; no service key or Google credential belongs in the
browser.

## Exclusions

Never export passwords, password hashes, access/refresh tokens, OAuth secrets,
Supabase keys, or database credentials. Date of birth stays in Supabase because
no staff reporting requirement for Sheets has been established. The long-form
reason and experience description also remain database-only by default.

## Idempotent upsert and queue

`student_profiles.registration_id` is the immutable sheet key. Locate it in
column A; append only when absent, otherwise update that row. A retry, status
decision, or profile correction must update the same row. If duplicate keys
are found in the sheet, fail and alert staff rather than append another row.

The database outbox key is `sheet_sync_logs(entity_type, entity_id)` with
`entity_type = MEMBERSHIP_APPLICATION`, `entity_id = membership_applications.id`,
and `operation = UPSERT`. A future database transaction should enqueue or
reset this row to `PENDING` when a registration is submitted, membership is
approved/rejected/suspended, or an exported profile field is corrected. These
event hooks are **not implemented in Phase 06**. A worker claims a pending row
as `SYNCING`, increments `attempt_count`, sets `last_attempt_at`, reads the
current database snapshot, and performs the sheet upsert. On success it sets
`SYNCED` and `synced_at`; on failure it sets `FAILED` with a short sanitized
error. Retry failed rows with bounded exponential backoff and monitoring. A
new change to the same entity resets the outbox row to `PENDING`, preserving
its identity so duplicate queue rows cannot form.

Google API failures happen in the worker after the PostgreSQL transaction has
committed. They cannot roll back a successful registration or membership
decision. Staff must be able to see failed syncs and retry them after repair.

Before implementing the worker, decide which Google account owns the sheet,
the credential storage method, the minimum required access scope, and whether
review notes and contact details should be included for that staff audience.

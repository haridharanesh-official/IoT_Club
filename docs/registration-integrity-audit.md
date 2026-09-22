# Phase 06 registration integrity audit (local)

Date: 2026-09-21. Branch: `feature/production-backend-integration`.
Production Supabase, GitHub, Vercel, Google OAuth, and Google Sheets were not
changed. The local app uses `http://localhost:3000` and the Supabase API uses
`http://127.0.0.1:54321`.

## Current frontend and exact field mapping

`/apply` redirects to `/register`. The active registration UI is
`app/register/registration-form.tsx`; it has Personal, Academic, IoT & Skills,
Account, and Review steps. The Account step explains the existing authenticated
identity and collects no password. Required means the UI blocks moving ahead
and the RPC or database also enforces the value where relevant. Optional empty
text is stored as SQL `NULL` for profile URLs, section, and gender.

| Step | Label / frontend property | Required and validation | Submitted property | Persisted destination / type |
|---|---|---|---|---|
| Personal | Full name / `full_name` | Yes; nonblank, max 160 server | `full_name` | `profiles.full_name` text |
| Personal | Date of birth / `date_of_birth` | Yes; valid date, 1900–today server | `date_of_birth` | `student_profiles.date_of_birth` date |
| Personal | Gender / `gender` | No; max 40 database | `gender` | `student_profiles.gender` text/null |
| Personal | Mobile number / `mobile_number` | Yes; 7–20 permitted characters | `mobile_number` | `student_profiles.mobile_number` text |
| Personal | Personal email / `personal_email` | Yes; email pattern, max 254 server | `personal_email` | `student_profiles.personal_email` lowercased text |
| Personal | College email / `collegeEmail` | From verified Auth; read-only | `college_email` is sent but ignored | `auth.users.email`, `profiles.email`, `student_profiles.college_email` text, taken from Auth |
| Academic | Register number / `register_number` | Yes; nonblank, max 40, case-insensitive unique | `register_number` | `student_profiles.register_number` text |
| Academic | Department / `department` | Yes; nonblank, max 120 | `department` | `student_profiles.department` text |
| Academic | Degree / programme / `degree_programme` | Yes; nonblank, max 120 | `degree_programme` | `student_profiles.degree_programme` text |
| Academic | Year / `year_of_study` | Yes; integer 1–6 | `year_of_study` number | `student_profiles.year_of_study` integer |
| Academic | Semester / `semester` | Yes; integer 1–12 | `semester` number | `student_profiles.semester` integer |
| Academic | Section / `section` | No | `section` | `student_profiles.section` text/null |
| Academic | Batch / `batch` | Yes; nonblank, max 30 | `batch` | `student_profiles.batch` text |
| IoT | Reason for joining / `reason_for_joining` | Yes; nonblank, max 2000 | `reason_for_joining` | `membership_applications.reason_for_joining` text |
| IoT | Areas of interest / `selectedInterests` | Yes; 1–10; fixed allowed values | `interests[]` | One `student_interests.interest` text row per option |
| IoT | Skill level / `skill_level` | Yes; explicit BEGINNER/INTERMEDIATE/ADVANCED | `skill_level` | `membership_applications.skill_level` enum |
| IoT | Previous experience / `previous_iot_experience` | Yes; explicit Yes/No | `previous_iot_experience` | `membership_applications.previous_iot_experience` boolean |
| IoT | Experience description / `experience_description` | Required if Yes; otherwise cleared server-side | `experience_description` | `membership_applications.experience_description` text/null |
| IoT | Programming: C, C++, Python, Java, JavaScript | Optional multiselect; category and choice constrained | `skills[]` with `category=PROGRAMMING` | `student_skills(category,skill,level)` enum/text/enum rows |
| IoT | Hardware: Arduino, ESP32, ESP8266, Raspberry Pi, STM32 | Optional multiselect; category and choice constrained | `skills[]` with `category=HARDWARE` | `student_skills(category,skill,level)` rows |
| IoT | Technology: MQTT, Node-RED, Home Assistant, Linux, Git / GitHub, Cloud, Networking | Optional multiselect; category and choice constrained | `skills[]` with `category=TECHNOLOGY` | `student_skills(category,skill,level)` rows |
| IoT | GitHub / `github_url` | No; HTTPS GitHub profile URL | `github_url` | `student_profiles.github_url` text/null |
| IoT | LinkedIn / `linkedin_url` | No; HTTPS LinkedIn profile/company URL | `linkedin_url` | `student_profiles.linkedin_url` text/null |
| IoT | Portfolio / `portfolio_url` | No; HTTPS URL with domain | `portfolio_url` | `student_profiles.portfolio_url` text/null |
| Review | Information accuracy / `consent_accuracy` | Yes; true | `consent_accuracy` | `membership_applications.consented_accuracy_at` timestamptz |
| Review | Club rules / `consent_rules` | Yes; true | `consent_rules` | `membership_applications.consented_rules_at` timestamptz |
| Review | Academic/membership/admin data use / `consent_data_use` | Yes; true | `consent_data_use` | `membership_applications.consented_data_use_at` timestamptz |

The account step has no application-table password. Supabase Auth owns the
password. The RPC obtains the actor UUID and confirmed college email from Auth,
generates `IOT-YYYY-XXXXX` from `registration_number_seq`, and sets the
application's `PENDING` status and timestamps in PostgreSQL. Role `STUDENT` and
membership `PENDING` come from the Auth profile trigger/database, never JSON.

## Discrepancies and corrections

Before this phase, previous experience and skill level had defaults rather
than explicit required answers. A profile URL could reach the database without
server validation. Three consents were checked but not stored. The admin
review screen did not show the full submitted record, and its locale-dependent
date formatting caused a hydration error. These were corrected without
changing the site's theme. Register-number uniqueness now also ignores case.

`college_email` remains in the client payload for display symmetry, but the RPC
deliberately ignores it and persists `auth.users.email`. Client-supplied role,
membership status, registration ID, and user ID are ignored. The reason and
experience description remain in Supabase and are excluded from the default
Sheets mirror.

## Synthetic registration and readback

The real `/register` UI submitted Test Student Alpha after local email
confirmation. The review screen showed all non-secret values; Back preserved
entered values; selecting Yes showed the conditional description field; missing
consent blocked submission; the button became disabled as `Submitting…`; and
the success route was `/membership/status` with `PENDING` and
`IOT-2026-00001`. A clean database reset followed by the same fresh UI flow
produced the same result.

| Frontend value | Stored value and destination | Result |
|---|---|---|
| Test Student Alpha | `profiles.full_name = Test Student Alpha` | PASS |
| 2006-06-15 / Male / 9000000001 | `student_profiles.date_of_birth/gender/mobile_number` matched | PASS |
| test.alpha@example.com | `student_profiles.personal_email` matched | PASS |
| test.alpha@college.example | `auth.users.email`, `profiles.email`, `student_profiles.college_email` matched | PASS |
| TEST-IOT-001 / Cyber Security / B.Tech | `student_profiles.register_number/department/degree_programme` matched | PASS |
| 2 / 3 / A / 2025-2029 | `student_profiles.year_of_study/semester/section/batch` matched | PASS |
| Synthetic registration integrity test | `membership_applications.reason_for_joining` matched | PASS |
| Internet of Things, Cybersecurity, Robotics | Three distinct `student_interests` rows matched | PASS |
| INTERMEDIATE / Yes / synthetic ESP32 description | `membership_applications.skill_level/previous_iot_experience/experience_description` matched | PASS |
| Python, C++ | Two `PROGRAMMING` rows, level INTERMEDIATE | PASS |
| ESP32, Raspberry Pi | Two `HARDWARE` rows, level INTERMEDIATE | PASS |
| MQTT, Linux, Git / GitHub | Three `TECHNOLOGY` rows, level INTERMEDIATE | PASS |
| https://github.com/example-test / blank LinkedIn and portfolio | `student_profiles.github_url` matched; other URLs `NULL` | PASS |
| Three checked consents | Three non-null `membership_applications.consented_*_at` timestamps | PASS |
| Browser did not supply valid role/status/ID | `STUDENT`, `PENDING`, `IOT-2026-00001` generated by DB | PASS |

After the clean reset the six required tables contained one matching auth user,
profile, student profile, application, three interests, and seven skills.
No password, hash, or token was queried from the database.

## Negative, atomicity, and access results

The repeatable local test is `tests/local-registration-integrity.mjs`; set
`LOCAL_TEST_PASSWORD` to the synthetic account password before running it.
It rejected empty name/DOB/register/department, invalid mobile/personal email,
year and semester outside range, no interests, no skill level, no experience
answer, Yes without description, invalid GitHub URL, and missing consent:
14/14 negative cases. The UI also visibly rejected missing personal fields,
missing IoT answers, invalid GitHub URL, and missing consent.

Same-account resubmission, case-insensitive duplicate register number from a
second confirmed synthetic account, and duplicate email signup were rejected.
Two concurrent RPC calls for one new account produced exactly one application
and one registration ID. A duplicate-skill failure after the RPC had updated
the profile rolled that profile name update back and left no student profile
or application. The pre-existing Auth profile remains by design: account
creation and later membership submission are separate transactions, so the
user can correct and retry a failed registration. An anonymous RPC call failed.
Browser-supplied `SUPER_ADMIN`, `APPROVED`, a foreign user ID, and a chosen
registration ID were ignored; the stored values remained STUDENT/PENDING with
a sequence-generated registration ID.

Pending logout and login returned to `/membership/status`; navigating to
`/dashboard` redirected back. A synthetic local admin reviewed all stored
fields and approved the application. The application and profile both changed
to APPROVED; `reviewed_at` and `reviewed_by` were populated; exactly one audit
log was created; the application count stayed one.

**Remaining defect:** approved login navigates to `/dashboard`, but the old
client `RouteGuard` still relies on mock `useIoTApp()` authentication and shows
“Authentication Required.” The server-side membership gate is correct. Fixing
the dashboard without exposing mock student data belongs to the student portal
migration, outside this registration data-integrity phase.

## Sheets, security, and engineering status

The exact A–AB column mapping, exclusions, registration-ID upsert key, outbox
events, retry behavior, and database-first failure rule are specified in
`docs/registration-sheets-mapping.md`. `sheet_sync_logs` now has the planned
`entity_type`, `entity_id`, `operation`, and four controlled sync states.
Event hooks, worker, Google credentials, and API calls are intentionally not
implemented. Google Sheets failure cannot affect registration because no
Sheets call runs in the registration transaction. Future worker failures must
be retried independently.

`npm ci`, typecheck, lint (zero errors, ten existing warnings), build, local
database reset, and local Security Advisor passed. The fresh pending-page
browser tab had no console errors or warnings. The earlier admin page
hydration error was reproduced and corrected; a reload showed no issue badge.
The Next.js development server emitted a cross-origin development warning but
no 500 during the registration flow. No production operation or push occurred.

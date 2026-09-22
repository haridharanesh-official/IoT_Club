# Phase 19 local truth and QA report — 2026-09-22

This is a local source audit of `hardening/phase19-liveops-qa` from `origin/main` at `33bea81`. It is **not** evidence that production has received these changes. No push, deployment, or production database write was performed.

## Route truth

The baseline had 20 files consuming the in-memory `useIoTApp` store, including a global provider and public routes. That store and its fake data are no longer imported by active application code. Unsupported operational screens have been replaced with honest unavailable messages: `/achievements`, `/challenges`, `/events`, `/lab`, `/lab/inventory`, `/lab/assets/[assetId]`, `/lab/live`, `/learn`, `/learn/skills`, `/opportunities`, `/projects`, `/projects/teams`, `/teacher`, `/teacher/analytics`, `/teacher/hardware`, `/admin/recruitment`, `/verify`, and `/verify/[certificateId]`. `/admin` and `/admin/audit` redirect to the real membership review. Removed prototype components and the mock store remain recoverable in Git history.

The public landing and about pages no longer display invented metrics, telemetry, staff contacts, social destinations, lab availability, or dead anchors. The footer links to available pages. `/register`, `/login`, `/dashboard`, `/membership/status`, `/member/[username]`, and `/admin/membership` are Supabase-backed but **cannot be accepted as live-ready** until local database replay and authenticated browser verification succeed.

## Registration and Sheets

- Recovered the historical production migration from the read-only Supabase migration ledger into `20260922090724_registration_form_simplification.sql`. A subsequent local migration derives application contact email from the confirmed account email, with one email field in the form. Neither migration has been replayed locally or applied to production.
- Sheets writes use `RAW`, preventing user-supplied spreadsheet formula evaluation. Two unit tests pass. The fake adapter lives only in `tests/fixtures`.
- A scheduled outbox endpoint and Vercel cron declaration are prepared. `CRON_SECRET` is not supplied, so the scheduled worker is not deploy-ready. The direct self-sync route reports actual failures instead of returning success for failed claims.
- The referenced Google service-account file does not exist at the supplied path, so real Sheets read/write, sharing, and retry behavior remain unverified. The outbox attempt counter/backoff behavior also needs database-backed testing.

## Security and credentials

- A local migration proposes a security-invoker public-profile view and tighter function grants; the public profile renderer now selects only approved, safe fields server-side. Database replay/RLS verification is still required.
- Read-only production advisor baseline reported a definer view, anon execution of `rls_auto_enable`, authenticated execution of `claim_sheet_sync_jobs`, and disabled leaked-password protection. Local source changes have not changed those production findings.
- `.env.local` is present and ignored by Git. Its variable names match the supplied local configuration; values were not included in this report. Local values are not proof of live credentials or a functioning local Supabase instance. Secrets pasted in chat should be rotated before any deployment.

## Verification ledger

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass after source cleanup |
| `npm run lint` | Pass, no warnings |
| `npm run build` | Pass, Next.js 15.5.25; 31 static pages generated |
| `npm run test:unit` | Pass, 2/2 Sheets RAW tests |
| `npm run test:e2e` | Pass, 2/2 public Chrome checks on port 3107; only landing, footer, unavailable telemetry page, and critical axe violations on landing covered |
| `npm audit` | **Open:** 1 high and 1 moderate advisory (`next`, `postcss`) |
| Local Supabase migration replay, auth/RLS, persistence, Mailpit | **Blocked**: Docker daemon unavailable |
| Real Sheets sync and recovery | **Blocked**: service-account JSON missing |
| Authenticated browser, full accessibility, visual, mobile, keyboard, Lighthouse | **Unverified** |
| Security tools (gitleaks, OSV, Semgrep, ZAP, Nuclei) and load testing | **Unverified** |

## Decision

**NO-GO for release.** Start Docker Desktop, supply the Google service-account JSON outside the repository, provide a distinct `CRON_SECRET`, and replay migrations in a disposable local database. Resolve the dependency advisories, then complete registration, role/RLS, Sheets retry, browser/accessibility, and security suites before considering a commit for review or any deployment. Production provider settings and migration application require an explicit, separately approved action.

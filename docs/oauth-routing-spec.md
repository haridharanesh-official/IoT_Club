# Google OAuth & Authoritative Auth Routing Specification

Date: 2026-09-21. Branch: `feature/production-backend-integration`.

This specification documents the local development and production requirements for Google OAuth 2.0 and unified post-login membership routing.

## 1. Environment & URL Configuration Matrix

| Setting | Local Development | Future Production (Target) |
|---|---|---|
| **App Canonical URL** | `http://localhost:3000` | `https://iotclub.dpdns.org` |
| **Supabase Project URL** | `http://127.0.0.1:54321` | `https://bsklvglcbvmofrkoflli.supabase.co` |
| **Google Cloud Authorized JavaScript Origin** | `http://localhost:3000` | `https://iotclub.dpdns.org` |
| **Google Cloud Authorized Redirect URI** | `http://127.0.0.1:54321/auth/v1/callback` | `https://bsklvglcbvmofrkoflli.supabase.co/auth/v1/callback` |
| **Supabase Site URL** | `http://localhost:3000` | `https://iotclub.dpdns.org` |
| **Supabase Redirect Allowlist** | `http://localhost:3000/auth/callback`<br>`http://localhost:3000/**` | `https://iotclub.dpdns.org/auth/callback`<br>`https://iotclub.dpdns.org/**` |

> [!NOTE]
> **Domain Clarification**: The actual production domain is `https://iotclub.dpdns.org`.
> References to `https://iotclub.in` are deprecated and must not be used unless explicitly approved.

> [!IMPORTANT]
> **OAuth Redirect URI Architecture**:
> In Supabase OAuth architecture:
> 1. The browser initiates auth with Supabase Auth: `/auth/v1/authorize?provider=google&redirect_to=<APP_CALLBACK>`.
> 2. Supabase Auth redirects to `accounts.google.com` with `redirect_uri = <SUPABASE_URL>/auth/v1/callback`.
> 3. Google Cloud Console verifies `<SUPABASE_URL>/auth/v1/callback`.
> 4. Google redirects user back to `<SUPABASE_URL>/auth/v1/callback` with authorization code.
> 5. Supabase Auth exchanges code for tokens, sets session, and redirects to `<APP_CALLBACK>` (e.g. `/auth/callback`).
>
> Therefore, Google Cloud Console **only requires** the Supabase Auth callback (`http://127.0.0.1:54321/auth/v1/callback` in dev; `https://bsklvglcbvmofrkoflli.supabase.co/auth/v1/callback` in prod). The app callback (`/auth/callback`) is handled by Supabase's redirect allowlist, NOT Google Cloud Console.

---

## 2. Google OAuth Lifecycle & Flows

```
[User Browser]
      |
      | 1. Click "Continue with Google"
      v
[Client (/login)] -> signInWithGoogle()
      |
      | 2. Redirect to Supabase Authorize Endpoint
      v
[Supabase Auth (127.0.0.1:54321)] -> 302 Redirect to Google
      |
      | 3. OAuth 2.0 Code Flow
      v
[accounts.google.com] -> User Selects Google Account / Consents
      |
      | 4. Redirect with auth code
      v
[Supabase Auth Callback (127.0.0.1:54321/auth/v1/callback)]
      |
      | 5. Code exchange, profile creation trigger, session cookie
      v
[Next.js App Callback (/auth/callback)]
      |
      | 6. Open redirect sanitization & resolveUserDestination()
      v
[Authoritative Destination (/register, /membership/status, /dashboard, /teacher, /admin)]
```

---

## 3. Authoritative Routing Rules

Post-login destinations are computed strictly server-side by `resolveUserDestination(userId?)` (`lib/auth/server.ts`):

1. **Unauthenticated Session**: Redirects to `/login`.
2. **Missing Profile**: Redirects to `/register`.
3. **Role SUPER_ADMIN or ADMIN**: Redirects to `/admin`.
4. **Role TEACHER**: Redirects to `/teacher`.
5. **Role STUDENT without Application**: Redirects to `/register`.
6. **Role STUDENT with Status APPROVED & Profile APPROVED**: Redirects to `/dashboard`.
7. **Role STUDENT with Status PENDING**: Redirects to `/membership/status`.
8. **Role STUDENT with Status REJECTED**: Redirects to `/membership/status`.
9. **Role STUDENT with Status SUSPENDED**: Redirects to `/membership/status`.

---

## 4. Open Redirect Prevention

The `/auth/callback` route validates all `next` destination parameters using `isSafeRelativeUrl()`:
- Must start with `/`
- Strictly prohibited from starting with `//` (protocol-relative attacks)
- Strictly prohibited from containing `\` (Windows parser path attacks)
- Prohibited from containing explicit protocols (`http:`, `https:`)
- Unsafe destinations fall back immediately to `resolveUserDestination()`.

---

## 5. Security Invariant: Authenticated User != Approved Member

Authenticating via Google OAuth or Email/Password merely establishes an **identity** in `auth.users` and creates a base `profiles` row with `role = STUDENT` and `membership_status = PENDING`. It does **not** grant access to protected member resources (`/dashboard`). Only explicit administrative approval promotes the application and profile to `APPROVED`.

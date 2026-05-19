# Portal Authentication & Admin Panel — Design Spec

> **Status:** Approved  
> **Date:** 2026-05-18  
> **Purpose:** Replace token-based portal access with password-protected, invite-only authentication with role-based access control and an admin panel.

---

## 1. Overview

The investor portal currently uses URL tokens (`/portal/lp/[token]`) for access — anyone with the link can view. This design replaces that with:

- **Supabase Auth** for login/session management
- **Role-based access** (admin / team / lp)
- **Invite-only registration** — admins create all accounts
- **Admin panel** for user management
- **RLS on every table** — no anonymous access to portal data

---

## 2. Roles & Permissions

| Role | Portal Access | Admin Panel | Can Invite Users |
|------|--------------|-------------|-----------------|
| `admin` | Team Portal + LP Portal + Admin Panel | Yes | Yes (all roles) |
| `team` | Team Portal + LP Portal (chooser) | No | No |
| `lp` | LP Portal only | No | No |

---

## 3. Database Schema

### New table: `portal_users`

```sql
CREATE TABLE portal_users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'team', 'lp')),
  project_id  uuid REFERENCES projects(id),
  is_active   boolean NOT NULL DEFAULT true,
  invited_by  uuid REFERENCES portal_users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_role ON portal_users(role);
CREATE INDEX idx_portal_users_project ON portal_users(project_id);
```

### Retire: `portal_links`

The `portal_links` table is no longer queried. It remains in the DB for historical reference but can be dropped in a future migration.

---

## 4. Row-Level Security (RLS)

RLS is enabled on ALL portal-related tables. No anonymous access.

### Helper function

```sql
CREATE OR REPLACE FUNCTION get_portal_user_role()
RETURNS text AS $$
  SELECT role FROM portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_portal_user_project()
RETURNS uuid AS $$
  SELECT project_id FROM portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Policy pattern (applied to each table)

**portal_users:**
- SELECT: admin sees all; others see own row
- INSERT/UPDATE/DELETE: admin only

**projects:**
- SELECT: authenticated user whose `project_id` matches
- INSERT/UPDATE/DELETE: admin only

**gantt_tasks, milestones, status_updates, fund_metrics, document_folders, documents, document_versions:**
- SELECT:
  - admin/team: rows where `project_id = get_portal_user_project()`
  - lp: same filter + `lp_visible = true` (where applicable)
- INSERT/UPDATE/DELETE: admin/team where `project_id = get_portal_user_project()`

### Anon key lockdown

The Supabase anon key gets NO access to portal tables. RLS policies only grant access to authenticated users with a matching `portal_users` row. The public website (non-portal pages) does not query any portal tables.

---

## 5. Authentication Flows

### 5a. Login

1. User visits any `/portal/*` route
2. Next.js middleware checks for valid Supabase session
3. If no session → redirect to `/portal/login`
4. User enters email + password
5. On success, server looks up role in `portal_users`
6. Redirect based on role:
   - `admin` / `team` → `/portal/choose`
   - `lp` → `/portal/lp/[projectId]`

### 5b. Invitation (admin action)

1. Admin navigates to `/portal/admin/users` → "Invite User"
2. Fills form: full name, email, role, project
3. Server action calls `supabase.auth.admin.inviteUserByEmail()` (service role key, server-only)
4. Server inserts row into `portal_users`
5. Invited user receives email with a link to set their password
6. User clicks link → `/portal/login/set-password` → sets password → account active

### 5c. Password reset

Standard Supabase Auth password reset flow. Link on login page → "Forgot password?" → email with reset link.

### 5d. Session management

- Supabase handles JWT tokens and refresh
- Server components use `createServerComponentClient` from `@supabase/auth-helpers-nextjs` (or equivalent for Next.js 16)
- Client components use `createBrowserClient`
- Sessions stored in HTTP-only cookies (not localStorage)

---

## 6. Route Structure

```
/portal/login                        — Public login page
/portal/login/set-password           — Set password (from invite email)

/portal/admin                        — Admin dashboard (admin only)
/portal/admin/users                  — User list + management
/portal/admin/users/invite           — Invite form

/portal/choose                       — Portal chooser (team + admin)

/portal/lp/[projectId]               — LP overview
/portal/lp/[projectId]/documents     — LP documents
/portal/lp/[projectId]/milestones    — LP milestones

/portal/team/[projectId]             — Team dashboard
/portal/team/[projectId]/gantt       — Gantt chart
/portal/team/[projectId]/updates     — Status updates
/portal/team/[projectId]/documents   — Team documents
/portal/team/[projectId]/visibility  — LP visibility toggles
```

**Breaking change:** Routes change from `[token]` to `[projectId]`. Token-based access is fully removed.

---

## 7. Middleware & Route Protection

Next.js middleware at `middleware.ts`:

```
/portal/login*          → public (no auth check)
/portal/admin*          → require auth + role = admin
/portal/team*           → require auth + role IN (admin, team)
/portal/lp*             → require auth + role IN (admin, team, lp)
/portal/choose          → require auth + role IN (admin, team)
/portal                 → redirect to /portal/login
```

If an authenticated user tries to access a route above their role, redirect to `/portal/choose` (team) or `/portal/lp/[projectId]` (lp).

---

## 8. Admin Panel

### `/portal/admin` — Dashboard
- Quick stats: total users by role, active vs inactive, recent logins
- Link to user management

### `/portal/admin/users` — User Management
- Table: Name, Email, Role, Project, Status, Last Login, Invited By
- Row actions: Deactivate / Reactivate, Change Role, Delete
- "Invite User" button

### `/portal/admin/users/invite` — Invite Form
- Fields: Full Name, Email, Role (dropdown), Project (dropdown)
- Validation: email format, no duplicates
- Server action: create auth user + portal_users row + send invite email

---

## 9. Portal Chooser

**`/portal/choose`** — shown to team and admin users after login.

Two cards (three for admin):
- **Team Portal** — "Manage tasks, milestones, documents, and LP visibility"
- **Investor Portal** — "View the portal as your LPs see it"
- **Admin Panel** (admin only) — "Manage users and portal settings"

Each card links to the user's assigned project.

---

## 10. Supabase Client Refactor

### Current state (insecure)
- `lib/supabase/client.ts` — anon key, used everywhere including client-side portal queries
- `lib/supabase/server.ts` — also anon key, no auth awareness

### New state

**`lib/supabase/client.ts`** — Browser client, session-aware:
```typescript
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`lib/supabase/server.ts`** — Server component client, reads cookies for session:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// Creates auth-aware client using cookie-based session
```

**`lib/supabase/admin.ts`** — Service role client, server-only (never imported on client):
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// Used only for admin operations: inviting users, managing accounts
```

### Dependency: `@supabase/ssr`
Add `@supabase/ssr` package for cookie-based session handling in Next.js.

---

## 11. Security Checklist

- [ ] RLS enabled on every portal table
- [ ] No anonymous SELECT on portal tables
- [ ] Service role key only in `lib/supabase/admin.ts`, never imported client-side
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` only (not `NEXT_PUBLIC_`)
- [ ] Middleware blocks unauthenticated access to all `/portal/*` except `/portal/login`
- [ ] Middleware enforces role-based route access
- [ ] Invite emails use Supabase Auth (no custom token generation)
- [ ] Passwords minimum 8 characters (Supabase Auth default)
- [ ] Sessions use HTTP-only cookies, not localStorage
- [ ] `portal_links` table no longer queried (retired)
- [ ] Old token-based routes removed

---

## 12. Bootstrap — First Admin

A seed script (run once during setup) creates the first admin:

1. Uses service role key to call `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
2. Inserts matching `portal_users` row with `role: 'admin'`
3. Admin email/password provided via environment variables or CLI prompt

After bootstrap, all further accounts are created through the admin UI.

---

## 13. Migration Path

### Phase 1: Add auth (this spec)
1. Add `portal_users` table + RLS policies
2. Add `@supabase/ssr` dependency
3. Refactor Supabase clients (client/server/admin)
4. Build login page, middleware, route protection
5. Build admin panel (dashboard, user management, invite)
6. Build portal chooser
7. Migrate portal routes from `[token]` to `[projectId]`
8. Update all portal components to use auth-aware queries
9. Seed first admin account
10. Enable RLS on all tables

### Phase 2: Cleanup (post-verification)
- Drop `portal_links` table
- Remove any residual token-based code

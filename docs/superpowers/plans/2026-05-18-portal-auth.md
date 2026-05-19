# Portal Auth & Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace token-based portal access with password-protected, invite-only authentication using Supabase Auth, role-based access control (admin/team/lp), and an admin panel for user management.

**Architecture:** Supabase Auth handles login/session via `@supabase/ssr` cookie-based sessions. A `portal_users` table stores role and project assignment. Next.js 16 `proxy.ts` guards all `/portal/*` routes. RLS policies on every portal table ensure no anonymous access. Server actions handle login, logout, and admin operations (invite, deactivate). The admin panel lives at `/portal/admin/*`.

**Tech Stack:** Next.js 16 (App Router), Supabase Auth + RLS, `@supabase/ssr`, Tailwind CSS 4, TypeScript, react-hook-form (already installed)

**Spec:** `docs/superpowers/specs/2026-05-18-portal-auth-design.md`

---

## File Structure

### New files

```
proxy.ts                                          — Route protection (replaces middleware.ts)
lib/supabase/admin.ts                             — Service-role client (server-only)
lib/auth/session.ts                               — Session helpers (getSession, getPortalUser)
lib/auth/actions.ts                               — Server actions (login, logout, invite, etc.)
lib/auth/types.ts                                 — Auth types (PortalUser, PortalRole, etc.)
app/portal/login/page.tsx                         — Login page
app/portal/login/set-password/page.tsx            — Set password (from invite link)
app/portal/choose/page.tsx                        — Portal chooser (team/admin)
app/portal/choose/layout.tsx                      — Chooser layout (auth guard)
app/portal/admin/page.tsx                         — Admin dashboard
app/portal/admin/layout.tsx                       — Admin layout (role guard)
app/portal/admin/users/page.tsx                   — User management table
app/portal/admin/users/invite/page.tsx            — Invite user form
components/portal/auth/LoginForm.tsx               — Login form component
components/portal/auth/SetPasswordForm.tsx         — Set password form
components/portal/auth/PortalChooser.tsx           — Portal chooser cards
components/portal/admin/UserTable.tsx              — Admin user table
components/portal/admin/InviteForm.tsx             — Admin invite form
components/portal/admin/AdminSidebar.tsx           — Admin sidebar nav
components/portal/admin/AdminShell.tsx             — Admin shell (sidebar + content)
scripts/seed-admin.ts                             — One-time admin seed script
```

### Modified files

```
lib/supabase/client.ts                            — Switch to @supabase/ssr createBrowserClient
lib/supabase/server.ts                            — Switch to @supabase/ssr createServerClient with cookies
lib/supabase/storage.ts                           — Use auth-aware client
lib/portal/queries.ts                             — All queries use auth-aware client
lib/portal/types.ts                               — Add PortalUser type
app/portal/layout.tsx                             — Add session provider
app/portal/lp/[token]/layout.tsx                  — Rename [token] → [projectId], use session auth
app/portal/lp/[token]/page.tsx                    — Use session-based data loading
app/portal/lp/[token]/documents/page.tsx          — Use session-based data loading
app/portal/lp/[token]/milestones/page.tsx         — Use session-based data loading
app/portal/team/[token]/layout.tsx                — Rename [token] → [projectId], use session auth
app/portal/team/[token]/page.tsx                  — Use session-based data loading
app/portal/team/[token]/gantt/page.tsx            — Use session-based data loading
app/portal/team/[token]/updates/page.tsx          — Use session-based data loading
app/portal/team/[token]/documents/page.tsx        — Use session-based data loading
app/portal/team/[token]/visibility/page.tsx       — Use session-based data loading
app/portal/invalid/page.tsx                       — Update to show login link
components/portal/PortalShell.tsx                 — Add logout button
components/portal/PortalSidebar.tsx               — Use projectId instead of token
next.config.ts                                    — Enable authInterrupts experimental flag
package.json                                      — Add @supabase/ssr dependency
```

---

### Task 1: Install dependencies and configure Next.js

**Files:**
- Modify: `mbo-fund-website/package.json`
- Modify: `mbo-fund-website/next.config.ts`

- [ ] **Step 1: Install @supabase/ssr**

Run from `mbo-fund-website/`:
```bash
npm install @supabase/ssr
```

Expected: Package added to dependencies in `package.json`.

- [ ] **Step 2: Enable authInterrupts in next.config.ts**

Replace the contents of `mbo-fund-website/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify the build still works**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "feat: add @supabase/ssr and enable authInterrupts"
```

---

### Task 2: Supabase database migration — portal_users table & RLS

**Files:**
- Create: `mbo-fund-website/supabase/migrations/20260518000000_portal_auth.sql`

This task creates the `portal_users` table, RLS helper functions, and policies on ALL portal tables. This migration should be applied via the Supabase dashboard SQL editor or CLI.

- [ ] **Step 1: Create the migration file**

Create `mbo-fund-website/supabase/migrations/20260518000000_portal_auth.sql`:

```sql
-- =============================================================
-- Portal Auth Migration: portal_users table + RLS on all tables
-- =============================================================

-- 1. Create portal_users table
CREATE TABLE IF NOT EXISTS portal_users (
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

CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_role ON portal_users(role);
CREATE INDEX IF NOT EXISTS idx_portal_users_project ON portal_users(project_id);

-- 2. Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_portal_user_role()
RETURNS text AS $$
  SELECT role FROM public.portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_portal_user_project()
RETURNS uuid AS $$
  SELECT project_id FROM public.portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Enable RLS on all tables
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- 4. portal_users policies
CREATE POLICY "admin_read_all_users" ON portal_users
  FOR SELECT USING (get_portal_user_role() = 'admin');

CREATE POLICY "user_read_own" ON portal_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_insert_users" ON portal_users
  FOR INSERT WITH CHECK (get_portal_user_role() = 'admin');

CREATE POLICY "admin_update_users" ON portal_users
  FOR UPDATE USING (get_portal_user_role() = 'admin');

CREATE POLICY "admin_delete_users" ON portal_users
  FOR DELETE USING (get_portal_user_role() = 'admin');

-- 5. projects policies
CREATE POLICY "user_read_own_project" ON projects
  FOR SELECT USING (id = get_portal_user_project());

CREATE POLICY "admin_manage_projects" ON projects
  FOR ALL USING (get_portal_user_role() = 'admin');

-- 6. gantt_tasks policies
CREATE POLICY "team_admin_read_tasks" ON gantt_tasks
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_tasks" ON gantt_tasks
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_tasks" ON gantt_tasks
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 7. milestones policies
CREATE POLICY "team_admin_read_milestones" ON milestones
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_milestones" ON milestones
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_milestones" ON milestones
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 8. status_updates policies
CREATE POLICY "team_admin_read_updates" ON status_updates
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_updates" ON status_updates
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_updates" ON status_updates
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 9. fund_metrics policies
CREATE POLICY "user_read_metrics" ON fund_metrics
  FOR SELECT USING (project_id = get_portal_user_project());

CREATE POLICY "team_admin_write_metrics" ON fund_metrics
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 10. document_folders policies
CREATE POLICY "team_admin_read_folders" ON document_folders
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_folders" ON document_folders
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_folders" ON document_folders
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 11. documents policies (join through folder)
CREATE POLICY "team_admin_read_docs" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_docs" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
      AND df.lp_visible = true
    )
    AND get_portal_user_role() = 'lp'
  );

CREATE POLICY "team_admin_write_docs" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 12. document_versions policies
CREATE POLICY "team_admin_read_versions" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_versions" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
      AND df.lp_visible = true
    )
    AND get_portal_user_role() = 'lp'
  );

CREATE POLICY "team_admin_write_versions" ON document_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 13. Revoke direct anon access (belt-and-suspenders)
-- The RLS policies above already block anon since auth.uid() will be null,
-- but explicitly revoking makes the intent clear.
REVOKE ALL ON portal_users FROM anon;
REVOKE ALL ON gantt_tasks FROM anon;
REVOKE ALL ON milestones FROM anon;
REVOKE ALL ON status_updates FROM anon;
REVOKE ALL ON fund_metrics FROM anon;
REVOKE ALL ON document_folders FROM anon;
REVOKE ALL ON documents FROM anon;
REVOKE ALL ON document_versions FROM anon;
```

- [ ] **Step 2: Apply the migration**

Run the SQL via Supabase dashboard (SQL Editor) or Supabase CLI:
```bash
supabase db push
```

Expected: All tables have RLS enabled, policies created, `portal_users` table exists.

- [ ] **Step 3: Verify RLS is active**

In Supabase SQL Editor, run:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('portal_users', 'projects', 'gantt_tasks', 'milestones', 'status_updates', 'fund_metrics', 'document_folders', 'documents', 'document_versions');
```

Expected: All rows show `rowsecurity = true`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add portal_users table and RLS policies on all portal tables"
```

---

### Task 3: Refactor Supabase clients for auth-aware sessions

**Files:**
- Modify: `mbo-fund-website/lib/supabase/client.ts`
- Modify: `mbo-fund-website/lib/supabase/server.ts`
- Create: `mbo-fund-website/lib/supabase/admin.ts`
- Modify: `mbo-fund-website/lib/supabase/storage.ts`

- [ ] **Step 1: Rewrite `lib/supabase/client.ts` to use `@supabase/ssr`**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Keep backward-compatible named export for existing portal queries
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 2: Rewrite `lib/supabase/server.ts` for cookie-based auth**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component — ignore.
            // The session refresh will be picked up by proxy.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create `lib/supabase/admin.ts` (service role, server-only)**

```typescript
import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 4: Update `lib/supabase/storage.ts` to use the browser client function**

Replace the import at the top of `lib/supabase/storage.ts`:

```typescript
import { createClient } from "./client";

const BUCKET = "portal-documents";

export async function uploadFile(
  projectId: string,
  folderId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  const supabase = createClient();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${projectId}/${folderId}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) return { path: "", error: error.message };
  return { path, error: null };
}

export function getPublicUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteFile(storagePath: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);
  return !error;
}
```

- [ ] **Step 5: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`**

Ensure `.env.local` has (do NOT prefix with NEXT_PUBLIC_):
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

- [ ] **Step 6: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds. No import errors.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase/
git commit -m "feat: refactor Supabase clients for auth-aware sessions"
```

---

### Task 4: Auth types and session helpers

**Files:**
- Create: `mbo-fund-website/lib/auth/types.ts`
- Create: `mbo-fund-website/lib/auth/session.ts`

- [ ] **Step 1: Create `lib/auth/types.ts`**

```typescript
export type PortalRole = "admin" | "team" | "lp";

export interface PortalUser {
  id: string;
  email: string;
  full_name: string;
  role: PortalRole;
  project_id: string | null;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
  last_login_at: string | null;
}
```

- [ ] **Step 2: Create `lib/auth/session.ts`**

```typescript
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PortalUser, PortalRole } from "./types";

/**
 * Get the current Supabase auth session.
 * Returns null if not authenticated — does NOT redirect.
 */
export const getSession = cache(async () => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Get the current portal user (auth user + portal_users row).
 * Returns null if not authenticated or no portal_users row exists.
 */
export const getPortalUser = cache(async (): Promise<PortalUser | null> => {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("portal_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  return data as PortalUser | null;
});

/**
 * Require authentication. Redirects to /portal/login if not authenticated.
 * Returns the portal user.
 */
export async function requireAuth(): Promise<PortalUser> {
  const portalUser = await getPortalUser();
  if (!portalUser) {
    redirect("/portal/login");
  }
  return portalUser;
}

/**
 * Require a specific role. Redirects if user doesn't have it.
 */
export async function requireRole(
  ...allowedRoles: PortalRole[]
): Promise<PortalUser> {
  const portalUser = await requireAuth();
  if (!allowedRoles.includes(portalUser.role)) {
    // Redirect based on what they CAN access
    if (portalUser.role === "lp" && portalUser.project_id) {
      redirect(`/portal/lp/${portalUser.project_id}`);
    }
    redirect("/portal/choose");
  }
  return portalUser;
}
```

- [ ] **Step 3: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/auth/
git commit -m "feat: add auth types and session helpers"
```

---

### Task 5: Proxy (route protection)

**Files:**
- Create: `mbo-fund-website/proxy.ts`

- [ ] **Step 1: Create `proxy.ts` at project root**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on portal routes
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  // Public portal routes — no auth needed
  if (
    pathname === "/portal/login" ||
    pathname.startsWith("/portal/login/")
  ) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie forwarding
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (important for token refresh)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated — redirect to login
  if (!user) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting /portal exactly — redirect to chooser
  if (pathname === "/portal" || pathname === "/portal/") {
    return NextResponse.redirect(new URL("/portal/choose", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*"],
};
```

- [ ] **Step 2: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds. `proxy.ts` is recognized by Next.js 16.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: add proxy.ts for portal route protection"
```

---

### Task 6: Server actions (login, logout, invite, user management)

**Files:**
- Create: `mbo-fund-website/lib/auth/actions.ts`

- [ ] **Step 1: Create `lib/auth/actions.ts`**

```typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPortalUser } from "./session";
import type { PortalRole } from "./types";

// --- Login ---

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Look up the user's role to determine redirect destination
  const { data: portalUser } = await supabase
    .from("portal_users")
    .select("role, project_id")
    .eq("email", email)
    .eq("is_active", true)
    .single();

  if (!portalUser) {
    // Auth user exists but no portal_users row — sign them out
    await supabase.auth.signOut();
    return { error: "Your account is not active. Contact an administrator." };
  }

  // Update last_login_at
  await supabase
    .from("portal_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("email", email);

  // Redirect based on role
  if (portalUser.role === "lp" && portalUser.project_id) {
    redirect(`/portal/lp/${portalUser.project_id}`);
  }
  redirect("/portal/choose");
}

// --- Logout ---

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

// --- Set password (from invite link) ---

export async function setPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Failed to set password. The link may have expired." };
  }

  redirect("/portal/login?message=Password+set+successfully.+Please+log+in.");
}

// --- Invite user (admin only) ---

export async function inviteUser(formData: FormData) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as PortalRole;
  const projectId = formData.get("projectId") as string;

  if (!email || !fullName || !role || !projectId) {
    return { error: "All fields are required." };
  }

  if (!["admin", "team", "lp"].includes(role)) {
    return { error: "Invalid role." };
  }

  // Check for duplicate email
  const { data: existing } = await supabaseAdmin
    .from("portal_users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "A user with this email already exists." };
  }

  // Create auth user and send invite email
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/login/set-password`,
    });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Failed to send invitation." };
  }

  // Insert portal_users row
  const { error: insertError } = await supabaseAdmin
    .from("portal_users")
    .insert({
      id: authUser.user.id,
      email,
      full_name: fullName,
      role,
      project_id: projectId,
      invited_by: currentUser.id,
    });

  if (insertError) {
    // Clean up the auth user if portal_users insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return { error: "Failed to create user record." };
  }

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Deactivate user (admin only) ---

export async function deactivateUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot deactivate yourself." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: "Failed to deactivate user." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Reactivate user (admin only) ---

export async function reactivateUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) return { error: "Failed to reactivate user." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Change role (admin only) ---

export async function changeUserRole(userId: string, newRole: PortalRole) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot change your own role." };
  }

  if (!["admin", "team", "lp"].includes(newRole)) {
    return { error: "Invalid role." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: "Failed to update role." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Delete user (admin only) ---

export async function deleteUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot delete yourself." };
  }

  // Delete from portal_users first (cascade will handle auth.users)
  const { error: portalError } = await supabaseAdmin
    .from("portal_users")
    .delete()
    .eq("id", userId);

  if (portalError) return { error: "Failed to delete user." };

  // Also remove from auth.users
  await supabaseAdmin.auth.admin.deleteUser(userId);

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- List all users (admin only) ---

export async function listUsers() {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized.", users: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("portal_users")
    .select("*, projects(name)")
    .order("created_at", { ascending: false });

  if (error) return { error: "Failed to load users.", users: [] };
  return { users: data ?? [] };
}

// --- List projects (for invite form dropdown) ---

export async function listProjects() {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized.", projects: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, name")
    .order("name");

  if (error) return { error: "Failed to load projects.", projects: [] };
  return { projects: data ?? [] };
}
```

- [ ] **Step 2: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/actions.ts
git commit -m "feat: add server actions for login, logout, invite, user management"
```

---

### Task 7: Login page and set-password page

**Files:**
- Create: `mbo-fund-website/components/portal/auth/LoginForm.tsx`
- Create: `mbo-fund-website/components/portal/auth/SetPasswordForm.tsx`
- Create: `mbo-fund-website/app/portal/login/page.tsx`
- Create: `mbo-fund-website/app/portal/login/set-password/page.tsx`

- [ ] **Step 1: Create `components/portal/auth/LoginForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth/actions";

export default function LoginForm({ message }: { message?: string }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-5">
      {message && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          {message}
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `components/portal/auth/SetPasswordForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { setPassword } from "@/lib/auth/actions";

export default function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPassword, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Minimum 8 characters"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Confirm your password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Setting password..." : "Set Password"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/portal/login/page.tsx`**

```tsx
import LoginForm from "@/components/portal/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-light text-white">Ownera Capital</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Sign in to access the portal
          </p>
        </div>
        <LoginForm message={message} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/portal/login/set-password/page.tsx`**

```tsx
import SetPasswordForm from "@/components/portal/auth/SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-light text-white">Set Your Password</h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Choose a password to access the Ownera Capital portal.
          </p>
        </div>
        <SetPasswordForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/portal/login/ components/portal/auth/
git commit -m "feat: add login and set-password pages"
```

---

### Task 8: Portal chooser page

**Files:**
- Create: `mbo-fund-website/components/portal/auth/PortalChooser.tsx`
- Create: `mbo-fund-website/app/portal/choose/page.tsx`

- [ ] **Step 1: Create `components/portal/auth/PortalChooser.tsx`**

```tsx
import Link from "next/link";
import type { PortalRole } from "@/lib/auth/types";

interface PortalChooserProps {
  role: PortalRole;
  projectId: string;
  userName: string;
}

export default function PortalChooser({
  role,
  projectId,
  userName,
}: PortalChooserProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-6">
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-light text-white">
          Welcome, {userName}
        </h1>
        <p className="mt-2 text-[15px] text-[#86868B]">
          Choose which portal to access
        </p>
      </div>
      <div className="grid w-full max-w-[640px] gap-4 sm:grid-cols-2">
        <Link
          href={`/portal/team/${projectId}`}
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04]"
        >
          <div className="mb-3 text-[24px]">▧</div>
          <h2 className="text-[17px] font-medium text-white">Team Portal</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
            Manage tasks, milestones, documents, and LP visibility.
          </p>
        </Link>
        <Link
          href={`/portal/lp/${projectId}`}
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04]"
        >
          <div className="mb-3 text-[24px]">◫</div>
          <h2 className="text-[17px] font-medium text-white">
            Investor Portal
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
            View the portal as your LPs see it.
          </p>
        </Link>
        {role === "admin" && (
          <Link
            href="/portal/admin"
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04] sm:col-span-2"
          >
            <div className="mb-3 text-[24px]">⚙</div>
            <h2 className="text-[17px] font-medium text-white">Admin Panel</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
              Manage users, invitations, and portal settings.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/portal/choose/page.tsx`**

```tsx
import { requireRole } from "@/lib/auth/session";
import PortalChooser from "@/components/portal/auth/PortalChooser";

export default async function ChoosePage() {
  const user = await requireRole("admin", "team");

  if (!user.project_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <h1 className="text-[28px] font-light text-white">
            No Project Assigned
          </h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Contact an administrator to be assigned to a project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortalChooser
      role={user.role}
      projectId={user.project_id}
      userName={user.full_name.split(" ")[0]}
    />
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd mbo-fund-website && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/portal/choose/ components/portal/auth/PortalChooser.tsx
git commit -m "feat: add portal chooser page for team and admin users"
```

---

### Task 9: Admin panel — shell, sidebar, dashboard, user management, invite

**Files:**
- Create: `mbo-fund-website/components/portal/admin/AdminSidebar.tsx`
- Create: `mbo-fund-website/components/portal/admin/AdminShell.tsx`
- Create: `mbo-fund-website/components/portal/admin/UserTable.tsx`
- Create: `mbo-fund-website/components/portal/admin/InviteForm.tsx`
- Create: `mbo-fund-website/app/portal/admin/layout.tsx`
- Create: `mbo-fund-website/app/portal/admin/page.tsx`
- Create: `mbo-fund-website/app/portal/admin/users/page.tsx`
- Create: `mbo-fund-website/app/portal/admin/users/invite/page.tsx`

- [ ] **Step 1: Create `components/portal/admin/AdminSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/admin", icon: "◫" },
  { label: "Users", href: "/portal/admin/users", icon: "◱" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/portal/admin") {
      return pathname === "/portal/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[200px] flex-col border-r border-white/[0.06] bg-[#0F0F0F] md:flex">
      <div className="border-b border-white/[0.06] px-4 pb-5 pt-5">
        <div className="text-[15px] font-semibold text-white">
          Ownera Capital
        </div>
        <div className="mt-0.5 text-[11px] text-[#86868B]">
          Admin Panel
        </div>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-200",
              isActive(item.href)
                ? "border-l-2 border-champagne bg-white/5 pl-[14px] text-white"
                : "text-[#86868B] hover:text-white/70"
            )}
          >
            <span className="w-4 text-center text-sm">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <Link
          href="/portal/choose"
          className="text-[12px] text-[#86868B] hover:text-white/70"
        >
          ← Back to Portal
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create `components/portal/admin/AdminShell.tsx`**

```tsx
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark text-[#e5e5e5]">
      <AdminSidebar />
      <div className="md:ml-[200px]">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/portal/admin/layout.tsx`**

```tsx
import { requireRole } from "@/lib/auth/session";
import AdminShell from "@/components/portal/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
```

- [ ] **Step 4: Create `app/portal/admin/page.tsx`**

```tsx
import { listUsers } from "@/lib/auth/actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const { users } = await listUsers();

  const adminCount = users.filter((u: any) => u.role === "admin").length;
  const teamCount = users.filter((u: any) => u.role === "team").length;
  const lpCount = users.filter((u: any) => u.role === "lp").length;
  const activeCount = users.filter((u: any) => u.is_active).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Admin Dashboard</h1>
        <p className="mt-1 text-[13px] text-[#86868B]">
          Manage portal users and settings.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: adminCount },
          { label: "Team Members", value: teamCount },
          { label: "LP Users", value: lpCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
              {stat.label}
            </div>
            <div className="mt-2 text-[28px] font-light text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/portal/admin/users"
          className="rounded-lg border border-white/15 px-4 py-2 text-[13px] text-[#e5e5e5] transition-colors hover:border-white/30"
        >
          Manage Users
        </Link>
        <Link
          href="/portal/admin/users/invite"
          className="rounded-lg bg-champagne px-4 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Invite User
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `components/portal/admin/UserTable.tsx`**

```tsx
"use client";

import { useState } from "react";
import { deactivateUser, reactivateUser, deleteUser, changeUserRole } from "@/lib/auth/actions";
import type { PortalRole } from "@/lib/auth/types";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: PortalRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  invited_by: string | null;
  projects?: { name: string } | null;
}

export default function UserTable({ users }: { users: UserRow[] }) {
  const [actionState, setActionState] = useState<Record<string, string>>({});

  async function handleDeactivate(userId: string) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await deactivateUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleReactivate(userId: string) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await reactivateUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await deleteUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleRoleChange(userId: string, newRole: PortalRole) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await changeUserRole(userId, newRole);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    team: "Team",
    lp: "LP",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-[2px] text-[#86868B]">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Role</th>
            <th className="pb-3 pr-4">Project</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Last Login</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
            >
              <td className="py-3 pr-4 text-white">{user.full_name}</td>
              <td className="py-3 pr-4 text-[#86868B]">{user.email}</td>
              <td className="py-3 pr-4">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as PortalRole)
                  }
                  className="rounded bg-white/[0.04] px-2 py-1 text-[12px] text-[#e5e5e5] outline-none border border-white/10"
                >
                  <option value="admin">Admin</option>
                  <option value="team">Team</option>
                  <option value="lp">LP</option>
                </select>
              </td>
              <td className="py-3 pr-4 text-[#86868B]">
                {user.projects?.name ?? "—"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3 pr-4 text-[11px] text-[#86868B]">
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Never"}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  {user.is_active ? (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      disabled={actionState[user.id] === "loading"}
                      className="text-[11px] text-amber-400 hover:text-amber-300 disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      disabled={actionState[user.id] === "loading"}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={actionState[user.id] === "loading"}
                    className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                {actionState[user.id] &&
                  actionState[user.id] !== "loading" && (
                    <div className="mt-1 text-[10px] text-red-400">
                      {actionState[user.id]}
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-[13px] text-[#86868B]">
          No users yet. Invite your first user to get started.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create `app/portal/admin/users/page.tsx`**

```tsx
import { listUsers } from "@/lib/auth/actions";
import UserTable from "@/components/portal/admin/UserTable";
import Link from "next/link";

export default async function AdminUsersPage() {
  const { users } = await listUsers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Users</h1>
          <p className="mt-1 text-[13px] text-[#86868B]">
            Manage portal access and roles.
          </p>
        </div>
        <Link
          href="/portal/admin/users/invite"
          className="rounded-lg bg-champagne px-4 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Invite User
        </Link>
      </div>
      <UserTable users={users as any} />
    </div>
  );
}
```

- [ ] **Step 7: Create `components/portal/admin/InviteForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { inviteUser } from "@/lib/auth/actions";
import type { PortalRole } from "@/lib/auth/types";

interface InviteFormProps {
  projects: { id: string; name: string }[];
}

export default function InviteForm({ projects }: InviteFormProps) {
  const [state, formAction, pending] = useActionState(inviteUser, null);

  return (
    <form action={formAction} className="max-w-[480px] space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          Invitation sent successfully.
        </div>
      )}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="John Smith"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="john@company.com"
        />
      </div>
      <div>
        <label
          htmlFor="role"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none focus:border-champagne/40 transition-colors"
        >
          <option value="">Select a role...</option>
          <option value="team">Team Member</option>
          <option value="lp">LP / Investor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="projectId"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none focus:border-champagne/40 transition-colors"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending invitation..." : "Send Invitation"}
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Create `app/portal/admin/users/invite/page.tsx`**

```tsx
import { listProjects } from "@/lib/auth/actions";
import InviteForm from "@/components/portal/admin/InviteForm";
import Link from "next/link";

export default async function InviteUserPage() {
  const { projects } = await listProjects();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/portal/admin/users"
          className="text-[12px] text-[#86868B] hover:text-white/70"
        >
          ← Back to Users
        </Link>
        <h1 className="mt-3 text-xl font-medium text-white">Invite User</h1>
        <p className="mt-1 text-[13px] text-[#86868B]">
          Send an invitation to join the portal. They will receive an email to
          set their password.
        </p>
      </div>
      <InviteForm projects={projects} />
    </div>
  );
}
```

- [ ] **Step 9: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add app/portal/admin/ components/portal/admin/
git commit -m "feat: add admin panel with dashboard, user management, and invite"
```

---

### Task 10: Migrate portal routes from [token] to [projectId] with auth

**Files:**
- Rename: `app/portal/lp/[token]/` → `app/portal/lp/[projectId]/`
- Rename: `app/portal/team/[token]/` → `app/portal/team/[projectId]/`
- Modify: All layout and page files within these directories
- Modify: `components/portal/PortalSidebar.tsx`
- Modify: `components/portal/PortalShell.tsx`

- [ ] **Step 1: Rename token directories to projectId**

```bash
cd mbo-fund-website
mv app/portal/lp/\[token\] app/portal/lp/\[projectId\]
mv app/portal/team/\[token\] app/portal/team/\[projectId\]
```

- [ ] **Step 2: Rewrite `app/portal/lp/[projectId]/layout.tsx`**

```tsx
import { requireRole } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";
import { redirect } from "next/navigation";

export default async function LPLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireRole("admin", "team", "lp");
  const { projectId } = await params;

  // Verify user has access to this project
  if (user.project_id !== projectId && user.role !== "admin") {
    redirect("/portal/choose");
  }

  const supabase = await createServerSupabase();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Portal";

  return (
    <PortalShell portalType="lp" projectId={projectId} projectName={projectName}>
      {children}
    </PortalShell>
  );
}
```

- [ ] **Step 3: Rewrite `app/portal/team/[projectId]/layout.tsx`**

```tsx
import { requireRole } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";
import { redirect } from "next/navigation";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireRole("admin", "team");
  const { projectId } = await params;

  // Verify user has access to this project
  if (user.project_id !== projectId && user.role !== "admin") {
    redirect("/portal/choose");
  }

  const supabase = await createServerSupabase();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Portal";

  return (
    <PortalShell portalType="team" projectId={projectId} projectName={projectName}>
      {children}
    </PortalShell>
  );
}
```

- [ ] **Step 4: Update `components/portal/PortalShell.tsx` to use projectId**

```tsx
import type { PortalType } from "@/lib/portal/types";
import PortalSidebar from "./PortalSidebar";
import { logout } from "@/lib/auth/actions";

interface PortalShellProps {
  portalType: PortalType;
  projectId: string;
  projectName: string;
  children: React.ReactNode;
}

export default function PortalShell({
  portalType,
  projectId,
  projectName,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-dark text-[#e5e5e5]">
      <PortalSidebar
        portalType={portalType}
        projectId={projectId}
        projectName={projectName}
      />
      <div className="md:ml-[200px]">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update `components/portal/PortalSidebar.tsx` — replace `token` with `projectId`, add logout**

Replace the `PortalSidebarProps` interface and related token references:

Change the interface:
```typescript
interface PortalSidebarProps {
  portalType: PortalType;
  projectId: string;
  projectName: string;
}
```

Change the component signature and `basePath`:
```typescript
export default function PortalSidebar({
  portalType,
  projectId,
  projectName,
}: PortalSidebarProps) {
  // ...
  const basePath = `/portal/${portalType}/${projectId}`;
```

Add a logout form at the bottom of the sidebar (inside the `<aside>` tag, after the `<nav>` closing tag):
```tsx
      <div className="border-t border-white/[0.06] p-4 space-y-2">
        <a
          href="/portal/choose"
          className="block text-[12px] text-[#86868B] hover:text-white/70"
        >
          ← Switch Portal
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="text-[12px] text-[#86868B] hover:text-red-400"
          >
            Sign Out
          </button>
        </form>
      </div>
```

Also add the import at the top:
```typescript
import { logout } from "@/lib/auth/actions";
```

- [ ] **Step 6: Update LP and Team page files — replace `token` params with `projectId`**

In every page file under `app/portal/lp/[projectId]/` and `app/portal/team/[projectId]/`, change:
- `params: Promise<{ token: string }>` → `params: Promise<{ projectId: string }>`
- `const { token } = use(params)` → `const { projectId } = use(params)`
- Remove `validateToken(token)` calls — the user's project comes from the session now
- Replace `link.project_id` with `projectId` directly in data-fetching calls

For the LP overview page (`app/portal/lp/[projectId]/page.tsx`), the data loading becomes:
```tsx
useEffect(() => {
  async function load() {
    const [met, mil, upd] = await Promise.all([
      getFundMetrics(projectId),
      getMilestones(projectId, true),
      getStatusUpdates(projectId, true),
    ]);
    setMetrics(met);
    setMilestones(mil.slice(0, 5));
    setUpdates(upd.slice(0, 1));
    setLoading(false);
  }
  load();
}, [projectId]);
```

Apply the same pattern to all page files — replace `token` → `projectId` and remove `validateToken` calls. The layout's `requireRole` check already handles auth.

- [ ] **Step 7: Update the invalid portal page**

Modify `app/portal/invalid/page.tsx` (or `components/portal/TokenInvalid.tsx`) to point users to login:

In `components/portal/TokenInvalid.tsx`, change the text and link:
```tsx
import Link from "next/link";

export default function TokenInvalid() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="max-w-md px-6 text-center">
        <div className="mb-4 text-[48px] font-extralight text-white">
          Access Denied
        </div>
        <p className="mb-8 text-[17px] leading-relaxed text-[#86868B]">
          You don't have access to this page, or your session has expired.
          Please sign in to continue.
        </p>
        <Link
          href="/portal/login"
          className="inline-block rounded-lg bg-champagne px-6 py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Update `lib/portal/queries.ts` — remove `validateToken`, use auth-aware client**

Remove the `validateToken` function (no longer needed — auth is handled by session/proxy). Keep all other query functions as-is — they already use the `supabase` client which is now auth-aware via `@supabase/ssr`.

Delete the `validateToken` function and the `PortalLink` import if unused elsewhere.

- [ ] **Step 9: Verify build**

```bash
cd mbo-fund-website && npm run build
```

Expected: Build succeeds. No references to `[token]` remain in portal routes.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: migrate portal from token-based to session-based auth with projectId routes"
```

---

### Task 11: Admin seed script

**Files:**
- Create: `mbo-fund-website/scripts/seed-admin.ts`

- [ ] **Step 1: Create `scripts/seed-admin.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log(`Creating admin user: ${ADMIN_EMAIL}`);

  // 1. Create auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

  if (authError) {
    console.error("Failed to create auth user:", authError.message);
    process.exit(1);
  }

  console.log(`Auth user created: ${authUser.user.id}`);

  // 2. Insert portal_users row
  const { error: portalError } = await supabase.from("portal_users").insert({
    id: authUser.user.id,
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    role: "admin",
    project_id: null,
  });

  if (portalError) {
    console.error("Failed to create portal user:", portalError.message);
    // Clean up auth user
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log("Admin user created successfully.");
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Role: admin`);
  console.log("You can now log in at /portal/login");
}

main();
```

- [ ] **Step 2: Add a script entry to `package.json`**

Add to the `"scripts"` section:
```json
"seed-admin": "npx tsx scripts/seed-admin.ts"
```

- [ ] **Step 3: Document usage**

Run with:
```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=securepassword123 ADMIN_NAME="Your Name" npm run seed-admin
```

- [ ] **Step 4: Commit**

```bash
git add scripts/ package.json
git commit -m "feat: add admin seed script for first-time setup"
```

---

### Task 12: Verify, test, and fix build

**Files:** All modified files

This is the final integration task. Test the full flow.

- [ ] **Step 1: Run full build**

```bash
cd mbo-fund-website && npm run build
```

Fix any type errors or import issues.

- [ ] **Step 2: Start dev server and test login flow**

```bash
cd mbo-fund-website && npm run dev
```

Test:
1. Visit `/portal` — should redirect to `/portal/login`
2. Visit `/portal/admin` — should redirect to `/portal/login`
3. Visit `/portal/lp/some-id` — should redirect to `/portal/login`
4. Log in with admin credentials — should go to `/portal/choose`
5. Click "Team Portal" — should load team dashboard
6. Click "Investor Portal" — should load LP overview
7. Click "Admin Panel" — should load admin dashboard
8. Go to "Users" → "Invite User" — form should work
9. Sign out — should redirect to login

- [ ] **Step 3: Verify RLS blocks anonymous access**

Open browser dev tools, try to call Supabase directly without auth:
```javascript
// In browser console (with anon key)
const { createClient } = await import('@supabase/supabase-js');
const s = createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY');
const { data, error } = await s.from('gantt_tasks').select('*');
console.log(data, error);
// Expected: data is [] or error is permission denied
```

- [ ] **Step 4: Verify LP role is restricted**

Log in as an LP user. Verify:
- Can access `/portal/lp/[projectId]` ✓
- Cannot access `/portal/team/[projectId]` — redirected
- Cannot access `/portal/admin` — redirected
- Cannot see the portal chooser — goes straight to LP portal

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: complete portal auth system — login, admin panel, RLS, role-based access"
```

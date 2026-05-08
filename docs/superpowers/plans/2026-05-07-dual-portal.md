# Dual Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-portal system (team + LP) within the existing mbo-fund-website Next.js app, backed by Supabase.

**Architecture:** New routes under `app/portal/` with a shared layout shell. Team portal at `/portal/team/[token]` (interactive), LP portal at `/portal/lp/[token]` (read-only). Supabase Postgres for data, Supabase Storage for documents. Token-based access with no authentication.

**Tech Stack:** Next.js 16, React 19, Supabase (Postgres + Storage), Tailwind CSS 4, Framer Motion, TypeScript 5

**Supabase Project:** `szrcixytxchpzchfmugx` (region: eu-west-1, name: MBO_Fund)
**Supabase URL:** `https://szrcixytxchpzchfmugx.supabase.co`
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmNpeHl0eGNocHpjaGZtdWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDI4NTgsImV4cCI6MjA5MzcxODg1OH0.cD7t6jHNwZe2UX3q4dg-TFdIpbcDHtFa4WEk6ecAApA`

**Design Spec:** `docs/superpowers/specs/2026-05-07-portal-design.md`

**Next.js 16 Notes (IMPORTANT — read before writing code):**
- `params` in pages, layouts, and route handlers is a **Promise** — must use `await params` in server components and `use(params)` in client components
- Route handlers use standard Web Request/Response APIs
- Check `node_modules/next/dist/docs/` for authoritative API reference if unsure

---

## File Structure

```
lib/
├── supabase/
│   ├── client.ts               # Browser Supabase client (singleton)
│   ├── server.ts               # Server Supabase client (for SSR/route handlers)
│   └── storage.ts              # Upload/download/delete helpers for portal-documents bucket
├── portal/
│   ├── types.ts                # All portal TypeScript types
│   ├── queries.ts              # Supabase query functions (CRUD for all portal tables)
│   └── utils.ts                # Token generation, date helpers, Gantt date-to-pixel math

app/
├── portal/
│   ├── layout.tsx              # Minimal layout (no Navbar/Footer, loads globals.css)
│   ├── invalid/
│   │   └── page.tsx            # "This link is no longer active" page
│   ├── team/
│   │   └── [token]/
│   │       ├── layout.tsx      # Team shell: validates token, renders PortalSidebar
│   │       ├── page.tsx        # Dashboard
│   │       ├── gantt/
│   │       │   └── page.tsx    # Interactive Gantt chart
│   │       ├── milestones/
│   │       │   └── page.tsx    # Milestones management
│   │       ├── updates/
│   │       │   └── page.tsx    # Status updates
│   │       ├── documents/
│   │       │   └── page.tsx    # Document management
│   │       └── visibility/
│   │           └── page.tsx    # LP Visibility control panel
│   └── lp/
│       └── [token]/
│           ├── layout.tsx      # LP shell: validates token, renders PortalSidebar
│           ├── page.tsx        # Overview (fund metrics + status)
│           ├── milestones/
│           │   └── page.tsx    # Read-only milestones
│           └── documents/
│               └── page.tsx    # Read-only documents

├── api/
│   └── portal/
│       ├── upload/
│       │   └── route.ts        # File upload endpoint
│       └── download/
│           └── route.ts        # File download endpoint (generates signed URL)

components/
├── portal/
│   ├── PortalSidebar.tsx       # Sidebar nav (adapts by portal type)
│   ├── PortalShell.tsx         # Shell layout (sidebar + content wrapper)
│   ├── TokenInvalid.tsx        # Invalid/expired token message
│   ├── gantt/
│   │   ├── GanttChart.tsx      # Full Gantt container (timeline header + rows)
│   │   ├── GanttBar.tsx        # Individual draggable bar with progress
│   │   ├── GanttTaskRow.tsx    # Task row (label area + track area)
│   │   ├── GanttMilestone.tsx  # Diamond milestone marker
│   │   └── GanttToolbar.tsx    # Top bar (time scale toggle, add task button)
│   ├── milestones/
│   │   ├── MilestoneList.tsx   # List container
│   │   └── MilestoneRow.tsx    # Individual milestone with status/toggle
│   ├── updates/
│   │   ├── StatusUpdateList.tsx    # Chronological update list
│   │   └── StatusUpdateEditor.tsx  # Markdown textarea + preview
│   ├── documents/
│   │   ├── DocumentBrowser.tsx     # Full document view (folders + upload zone)
│   │   ├── DocumentFolder.tsx      # Single folder with toggle + file list
│   │   ├── DocumentRow.tsx         # Single file row with actions
│   │   ├── VersionHistory.tsx      # Expandable version panel
│   │   └── FileUploadZone.tsx      # Drag-and-drop upload area
│   ├── metrics/
│   │   ├── FundMetricsGrid.tsx     # 2x2 read-only metrics cards
│   │   └── FundMetricsForm.tsx     # Editable form for team
│   └── shared/
│       ├── VisibilityToggle.tsx    # Champagne on/off toggle
│       ├── StatusBadge.tsx         # Status pill (pending/in-progress/completed/delayed)
│       └── PortalButton.tsx        # Button component for portal (not Link-based like site Button)
```

---

## Task 1: Install Supabase & Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Modify: `lib/supabase/client.ts` (new)
- Modify: `lib/supabase/server.ts` (new)

- [ ] **Step 1: Install @supabase/supabase-js**

```bash
cd "C:/Users/volko/Desktop/MBO Fund Exercise/mbo-fund-website"
npm install @supabase/supabase-js
```

Expected: Package added to dependencies in package.json.

- [ ] **Step 2: Create .env.local**

Create `C:/Users/volko/Desktop/MBO Fund Exercise/mbo-fund-website/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://szrcixytxchpzchfmugx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmNpeHl0eGNocHpjaGZtdWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDI4NTgsImV4cCI6MjA5MzcxODg1OH0.cD7t6jHNwZe2UX3q4dg-TFdIpbcDHtFa4WEk6ecAApA
```

- [ ] **Step 3: Create browser Supabase client**

Create `lib/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Create server Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 5: Verify .env.local is in .gitignore**

Check that `.gitignore` includes `.env.local`. If not, add it.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/supabase/ .env.local .gitignore
git commit -m "feat: add Supabase client setup and environment config"
```

---

## Task 2: Create Supabase Database Schema

**Files:**
- No local files — all executed via Supabase MCP

Use the `mcp__supabase__apply_migration` tool for each migration. The project_id is `szrcixytxchpzchfmugx`.

- [ ] **Step 1: Create portal_links table**

Migration name: `create_portal_links`

```sql
CREATE TABLE portal_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('team', 'lp')),
  label text NOT NULL DEFAULT '',
  project_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_portal_links_token ON portal_links (token);
```

- [ ] **Step 2: Create projects table**

Migration name: `create_projects`

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  start_date date,
  target_end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 3: Add foreign key from portal_links to projects**

Migration name: `add_portal_links_project_fk`

```sql
ALTER TABLE portal_links
  ADD CONSTRAINT fk_portal_links_project
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL;
```

- [ ] **Step 4: Create gantt_tasks table**

Migration name: `create_gantt_tasks`

```sql
CREATE TABLE gantt_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  parent_id uuid REFERENCES gantt_tasks (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  color text,
  lp_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gantt_tasks_project ON gantt_tasks (project_id);
```

- [ ] **Step 5: Create milestones table**

Migration name: `create_milestones`

```sql
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
  sort_order integer NOT NULL DEFAULT 0,
  lp_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_project ON milestones (project_id);
```

- [ ] **Step 6: Create status_updates table**

Migration name: `create_status_updates`

```sql
CREATE TABLE status_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  lp_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_updates_project ON status_updates (project_id);
```

- [ ] **Step 7: Create fund_metrics table**

Migration name: `create_fund_metrics`

```sql
CREATE TABLE fund_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  fund_size numeric NOT NULL DEFAULT 0,
  capital_deployed_pct numeric NOT NULL DEFAULT 0 CHECK (capital_deployed_pct >= 0 AND capital_deployed_pct <= 100),
  deal_count integer NOT NULL DEFAULT 0,
  vintage_year integer NOT NULL DEFAULT 2026,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fund_metrics_project ON fund_metrics (project_id);
```

- [ ] **Step 8: Create document_folders table**

Migration name: `create_document_folders`

```sql
CREATE TABLE document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  lp_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_folders_project ON document_folders (project_id);
```

- [ ] **Step 9: Create documents and document_versions tables**

Migration name: `create_documents`

```sql
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES document_folders (id) ON DELETE CASCADE,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  storage_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  uploaded_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  version integer NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  uploaded_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_folder ON documents (folder_id);
CREATE INDEX idx_document_versions_doc ON document_versions (document_id);
```

- [ ] **Step 10: Disable RLS on all portal tables**

Migration name: `disable_rls_portal_tables`

Since there's no user auth (token validation is in the Next.js layer), RLS would block the anon key. Disable it so the anon client can read/write.

```sql
ALTER TABLE portal_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE fund_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions DISABLE ROW LEVEL SECURITY;
```

- [ ] **Step 11: Create Supabase Storage bucket**

Use `mcp__supabase__execute_sql` to create the storage bucket:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-documents', 'portal-documents', true)
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 12: Seed initial project and portal links**

Migration name: `seed_initial_data`

```sql
-- Create initial project
INSERT INTO projects (id, name, description, start_date, target_end_date)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Fund I',
  'Ownera Capital Fund I',
  '2026-01-01',
  '2026-12-31'
);

-- Create team portal link
INSERT INTO portal_links (token, type, label, project_id)
VALUES ('team-abc12345', 'team', 'Deal Team Link', 'a0000000-0000-0000-0000-000000000001');

-- Create LP portal link
INSERT INTO portal_links (token, type, label, project_id)
VALUES ('lp-xyz98765', 'lp', 'LP Investor Link', 'a0000000-0000-0000-0000-000000000001');

-- Create initial fund metrics
INSERT INTO fund_metrics (project_id, fund_size, capital_deployed_pct, deal_count, vintage_year)
VALUES ('a0000000-0000-0000-0000-000000000001', 150000000, 34, 3, 2026);
```

- [ ] **Step 13: Verify schema**

Use `mcp__supabase__list_tables` with `verbose: true` to confirm all tables were created correctly.

---

## Task 3: Portal Types & Query Layer

**Files:**
- Create: `lib/portal/types.ts`
- Create: `lib/portal/queries.ts`
- Create: `lib/portal/utils.ts`
- Create: `lib/supabase/storage.ts`

- [ ] **Step 1: Create portal types**

Create `lib/portal/types.ts`:

```typescript
export type PortalType = "team" | "lp";

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "delayed";

export interface PortalLink {
  id: string;
  token: string;
  type: PortalType;
  label: string;
  project_id: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string | null;
  target_end_date: string | null;
  created_at: string;
}

export interface GanttTask {
  id: string;
  project_id: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  parent_id: string | null;
  sort_order: number;
  color: string | null;
  lp_visible: boolean;
  created_at: string;
  updated_at: string;
  children?: GanttTask[];
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  sort_order: number;
  lp_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusUpdate {
  id: string;
  project_id: string;
  title: string;
  body: string;
  lp_visible: boolean;
  created_at: string;
}

export interface FundMetrics {
  id: string;
  project_id: string;
  fund_size: number;
  capital_deployed_pct: number;
  deal_count: number;
  vintage_year: number;
  updated_at: string;
}

export interface DocumentFolder {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  lp_visible: boolean;
  created_at: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  folder_id: string;
  name: string;
  version: number;
  storage_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  storage_path: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}
```

- [ ] **Step 2: Create query functions**

Create `lib/portal/queries.ts`:

```typescript
import { supabase } from "@/lib/supabase/client";
import type {
  PortalLink,
  Project,
  GanttTask,
  Milestone,
  StatusUpdate,
  FundMetrics,
  DocumentFolder,
  Document,
  DocumentVersion,
  MilestoneStatus,
} from "./types";

// --- Portal Links ---

export async function validateToken(token: string): Promise<PortalLink | null> {
  const { data } = await supabase
    .from("portal_links")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data as PortalLink;
}

// --- Projects ---

export async function getProject(projectId: string): Promise<Project | null> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  return data as Project | null;
}

// --- Gantt Tasks ---

export async function getGanttTasks(
  projectId: string,
  lpOnly = false
): Promise<GanttTask[]> {
  let query = supabase
    .from("gantt_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (lpOnly) {
    query = query.eq("lp_visible", true);
  }

  const { data } = await query;
  return (data as GanttTask[]) ?? [];
}

export async function updateGanttTask(
  taskId: string,
  updates: Partial<Pick<GanttTask, "title" | "start_date" | "end_date" | "progress" | "sort_order" | "color" | "lp_visible">>
): Promise<GanttTask | null> {
  const { data } = await supabase
    .from("gantt_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();
  return data as GanttTask | null;
}

export async function createGanttTask(
  task: Pick<GanttTask, "project_id" | "title" | "start_date" | "end_date"> &
    Partial<Pick<GanttTask, "parent_id" | "color" | "sort_order">>
): Promise<GanttTask | null> {
  const { data } = await supabase
    .from("gantt_tasks")
    .insert(task)
    .select()
    .single();
  return data as GanttTask | null;
}

export async function deleteGanttTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("gantt_tasks")
    .delete()
    .eq("id", taskId);
  return !error;
}

// --- Milestones ---

export async function getMilestones(
  projectId: string,
  lpOnly = false
): Promise<Milestone[]> {
  let query = supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (lpOnly) {
    query = query.eq("lp_visible", true);
  }

  const { data } = await query;
  return (data as Milestone[]) ?? [];
}

export async function updateMilestone(
  milestoneId: string,
  updates: Partial<Pick<Milestone, "title" | "description" | "due_date" | "status" | "sort_order" | "lp_visible">>
): Promise<Milestone | null> {
  const { data } = await supabase
    .from("milestones")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", milestoneId)
    .select()
    .single();
  return data as Milestone | null;
}

export async function createMilestone(
  milestone: Pick<Milestone, "project_id" | "title" | "due_date"> &
    Partial<Pick<Milestone, "description" | "status" | "sort_order">>
): Promise<Milestone | null> {
  const { data } = await supabase
    .from("milestones")
    .insert(milestone)
    .select()
    .single();
  return data as Milestone | null;
}

export async function deleteMilestone(milestoneId: string): Promise<boolean> {
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId);
  return !error;
}

// --- Status Updates ---

export async function getStatusUpdates(
  projectId: string,
  lpOnly = false
): Promise<StatusUpdate[]> {
  let query = supabase
    .from("status_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (lpOnly) {
    query = query.eq("lp_visible", true);
  }

  const { data } = await query;
  return (data as StatusUpdate[]) ?? [];
}

export async function createStatusUpdate(
  update: Pick<StatusUpdate, "project_id" | "title" | "body">
): Promise<StatusUpdate | null> {
  const { data } = await supabase
    .from("status_updates")
    .insert(update)
    .select()
    .single();
  return data as StatusUpdate | null;
}

export async function updateStatusUpdate(
  updateId: string,
  updates: Partial<Pick<StatusUpdate, "title" | "body" | "lp_visible">>
): Promise<StatusUpdate | null> {
  const { data } = await supabase
    .from("status_updates")
    .update(updates)
    .eq("id", updateId)
    .select()
    .single();
  return data as StatusUpdate | null;
}

export async function deleteStatusUpdate(updateId: string): Promise<boolean> {
  const { error } = await supabase
    .from("status_updates")
    .delete()
    .eq("id", updateId);
  return !error;
}

// --- Fund Metrics ---

export async function getFundMetrics(
  projectId: string
): Promise<FundMetrics | null> {
  const { data } = await supabase
    .from("fund_metrics")
    .select("*")
    .eq("project_id", projectId)
    .single();
  return data as FundMetrics | null;
}

export async function updateFundMetrics(
  projectId: string,
  updates: Partial<Pick<FundMetrics, "fund_size" | "capital_deployed_pct" | "deal_count" | "vintage_year">>
): Promise<FundMetrics | null> {
  const { data } = await supabase
    .from("fund_metrics")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .select()
    .single();
  return data as FundMetrics | null;
}

// --- Document Folders ---

export async function getDocumentFolders(
  projectId: string,
  lpOnly = false
): Promise<DocumentFolder[]> {
  let query = supabase
    .from("document_folders")
    .select("*, documents(*)")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (lpOnly) {
    query = query.eq("lp_visible", true);
  }

  const { data } = await query;
  return (data as DocumentFolder[]) ?? [];
}

export async function createDocumentFolder(
  folder: Pick<DocumentFolder, "project_id" | "name"> &
    Partial<Pick<DocumentFolder, "sort_order">>
): Promise<DocumentFolder | null> {
  const { data } = await supabase
    .from("document_folders")
    .insert(folder)
    .select()
    .single();
  return data as DocumentFolder | null;
}

export async function updateDocumentFolder(
  folderId: string,
  updates: Partial<Pick<DocumentFolder, "name" | "sort_order" | "lp_visible">>
): Promise<DocumentFolder | null> {
  const { data } = await supabase
    .from("document_folders")
    .update(updates)
    .eq("id", folderId)
    .select()
    .single();
  return data as DocumentFolder | null;
}

// --- Documents ---

export async function getDocumentVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  const { data } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version", { ascending: false });
  return (data as DocumentVersion[]) ?? [];
}

export async function createDocument(
  doc: Pick<Document, "folder_id" | "name" | "storage_path" | "file_size" | "mime_type" | "uploaded_by">
): Promise<Document | null> {
  const { data } = await supabase
    .from("documents")
    .insert(doc)
    .select()
    .single();
  return data as Document | null;
}

export async function replaceDocumentVersion(
  documentId: string,
  newStoragePath: string,
  newFileSize: number,
  uploadedBy: string
): Promise<Document | null> {
  // Get current document
  const { data: current } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (!current) return null;

  // Save current version to history
  await supabase.from("document_versions").insert({
    document_id: documentId,
    version: current.version,
    storage_path: current.storage_path,
    file_size: current.file_size,
    uploaded_by: current.uploaded_by,
    created_at: current.updated_at,
  });

  // Update document with new version
  const { data } = await supabase
    .from("documents")
    .update({
      version: current.version + 1,
      storage_path: newStoragePath,
      file_size: newFileSize,
      uploaded_by: uploadedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  return data as Document | null;
}
```

- [ ] **Step 3: Create portal utility functions**

Create `lib/portal/utils.ts`:

```typescript
export function generateToken(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getFileTypeInfo(mimeType: string): { label: string; colorClass: string } {
  if (mimeType === "application/pdf") return { label: "PDF", colorClass: "bg-red-500/15 text-red-400" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return { label: "XLS", colorClass: "bg-emerald-500/15 text-emerald-400" };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return { label: "PPT", colorClass: "bg-amber-500/15 text-amber-400" };
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { label: "DOC", colorClass: "bg-blue-500/15 text-blue-400" };
  return { label: "FILE", colorClass: "bg-white/10 text-white/50" };
}

// Gantt date-to-pixel math
export function dateToPercent(
  date: string,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const d = new Date(date);
  const total = rangeEnd.getTime() - rangeStart.getTime();
  if (total <= 0) return 0;
  const offset = d.getTime() - rangeStart.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

export function percentToDate(
  percent: number,
  rangeStart: Date,
  rangeEnd: Date
): Date {
  const total = rangeEnd.getTime() - rangeStart.getTime();
  return new Date(rangeStart.getTime() + (percent / 100) * total);
}

export function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}
```

- [ ] **Step 4: Create storage helpers**

Create `lib/supabase/storage.ts`:

```typescript
import { supabase } from "./client";

const BUCKET = "portal-documents";

export async function uploadFile(
  projectId: string,
  folderId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
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
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteFile(storagePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);
  return !error;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/portal/ lib/supabase/storage.ts
git commit -m "feat: add portal types, query layer, and storage helpers"
```

---

## Task 4: Portal Layout Shell & Shared Components

**Files:**
- Create: `app/portal/layout.tsx`
- Create: `app/portal/invalid/page.tsx`
- Create: `components/portal/PortalShell.tsx`
- Create: `components/portal/PortalSidebar.tsx`
- Create: `components/portal/TokenInvalid.tsx`
- Create: `components/portal/shared/VisibilityToggle.tsx`
- Create: `components/portal/shared/StatusBadge.tsx`
- Create: `components/portal/shared/PortalButton.tsx`

- [ ] **Step 1: Create portal root layout**

This layout strips the Navbar/Footer from portal routes. Create `app/portal/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ownera Capital — Portal",
  description: "Ownera Capital investor and deal team portal.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**IMPORTANT:** Because the root `app/layout.tsx` includes `<Navbar />` and `<Footer />`, those will render inside portal routes too. We need to modify the root layout to conditionally exclude them for portal routes. The cleanest approach: use a route group. Move the existing marketing pages into `app/(site)/` and keep `app/portal/` separate. Both groups share the root layout, but the site group gets its own layout with Navbar/Footer.

**Alternative (simpler, no restructure):** Modify `app/layout.tsx` so it does NOT render Navbar/Footer — instead, create `app/(site)/layout.tsx` that adds them. Portal routes at `app/portal/` get the clean root layout only.

Restructure:
1. Create `app/(site)/` directory
2. Move `app/page.tsx` → `app/(site)/page.tsx`
3. Move `app/about/` → `app/(site)/about/`
4. Move `app/contact/` → `app/(site)/contact/`
5. Move `app/for-owners/` → `app/(site)/for-owners/`
6. Move `app/for-teams/` → `app/(site)/for-teams/`
7. Move `app/sectors/` → `app/(site)/sectors/`
8. Move `app/team/` → `app/(site)/team/`
9. Move `app/track-record/` → `app/(site)/track-record/`

Update `app/layout.tsx` (root — no Navbar/Footer):

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ownera Capital — Management Buyouts & Succession Partners",
  description:
    "The trusted PE partner for management-led ownership transitions. MBO and MBI solutions for business owners, management teams, and operators across the US, Europe, Israel, and Latin America.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

Create `app/(site)/layout.tsx`:

```tsx
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify marketing site still works after restructure**

```bash
cd "C:/Users/volko/Desktop/MBO Fund Exercise/mbo-fund-website"
npm run build
```

Expected: Build succeeds. All existing routes still work at the same URLs (route groups don't affect URLs).

- [ ] **Step 3: Create portal layout**

Create `app/portal/layout.tsx`:

```tsx
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-dark">{children}</div>;
}
```

- [ ] **Step 4: Create PortalSidebar component**

Create `components/portal/PortalSidebar.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PortalType } from "@/lib/portal/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface PortalSidebarProps {
  portalType: PortalType;
  token: string;
  projectName: string;
}

const TEAM_NAV: NavItem[] = [
  { label: "Dashboard", href: "", icon: "◫" },
  { label: "Gantt Chart", href: "/gantt", icon: "▧" },
  { label: "Milestones", href: "/milestones", icon: "◈" },
  { label: "Status Updates", href: "/updates", icon: "◱" },
  { label: "Documents", href: "/documents", icon: "◰" },
];

const TEAM_NAV_BOTTOM: NavItem[] = [
  { label: "LP Visibility", href: "/visibility", icon: "◉" },
];

const LP_NAV: NavItem[] = [
  { label: "Overview", href: "", icon: "◫" },
  { label: "Milestones", href: "/milestones", icon: "◈" },
  { label: "Documents", href: "/documents", icon: "◰" },
];

export default function PortalSidebar({
  portalType,
  token,
  projectName,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = `/portal/${portalType}/${token}`;
  const navItems = portalType === "team" ? TEAM_NAV : LP_NAV;
  const bottomItems = portalType === "team" ? TEAM_NAV_BOTTOM : [];

  const isActive = (itemHref: string) => {
    const fullPath = basePath + itemHref;
    if (itemHref === "") {
      return pathname === basePath || pathname === basePath + "/";
    }
    return pathname.startsWith(fullPath);
  };

  const portalLabel =
    portalType === "team"
      ? `${projectName} — Deal Team`
      : `${projectName} — Investor Portal`;

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0F0F0F] px-4 py-3 md:hidden">
        <div>
          <div className="text-[15px] font-semibold text-white">
            Ownera Capital
          </div>
          <div className="text-[11px] text-[#86868B]">{portalLabel}</div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/70"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-[200px] flex-col border-r border-white/[0.06] bg-[#0F0F0F]",
          "transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="border-b border-white/[0.06] px-4 pb-5 pt-5">
          <div className="text-[15px] font-semibold text-white">
            Ownera Capital
          </div>
          <div className="mt-0.5 text-[11px] text-[#86868B]">
            {portalLabel}
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={basePath + item.href}
              onClick={() => setMobileOpen(false)}
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

          {/* Divider + bottom nav */}
          {bottomItems.length > 0 && (
            <>
              <div className="mx-4 my-2 h-px bg-white/[0.06]" />
              {bottomItems.map((item) => (
                <Link
                  key={item.href}
                  href={basePath + item.href}
                  onClick={() => setMobileOpen(false)}
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
            </>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 5: Create PortalShell component**

Create `components/portal/PortalShell.tsx`:

```tsx
import type { PortalType } from "@/lib/portal/types";
import PortalSidebar from "./PortalSidebar";

interface PortalShellProps {
  portalType: PortalType;
  token: string;
  projectName: string;
  children: React.ReactNode;
}

export default function PortalShell({
  portalType,
  token,
  projectName,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-dark text-[#e5e5e5]">
      <PortalSidebar
        portalType={portalType}
        token={token}
        projectName={projectName}
      />
      <div className="md:ml-[200px]">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create shared portal components**

Create `components/portal/shared/VisibilityToggle.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
  label?: string;
}

export default function VisibilityToggle({
  isVisible,
  onToggle,
  label,
}: VisibilityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-[10px] uppercase tracking-[0.5px] text-[#86868B]">
          {label}
        </span>
      )}
      <button
        onClick={() => onToggle(!isVisible)}
        className={cn(
          "relative h-[18px] w-[32px] rounded-full transition-colors duration-200",
          isVisible ? "bg-champagne" : "bg-[#333]"
        )}
        aria-label={isVisible ? "Hide from LPs" : "Show to LPs"}
      >
        <div
          className={cn(
            "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-[left] duration-200",
            isVisible ? "left-[16px]" : "left-[2px]"
          )}
        />
      </button>
    </div>
  );
}
```

Create `components/portal/shared/StatusBadge.tsx`:

```tsx
import { cn } from "@/lib/utils";
import type { MilestoneStatus } from "@/lib/portal/types";

const STATUS_STYLES: Record<MilestoneStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Completed" },
  in_progress: { bg: "bg-amber-500/15", text: "text-amber-400", label: "In Progress" },
  pending: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Pending" },
  delayed: { bg: "bg-red-500/15", text: "text-red-400", label: "Delayed" },
};

const DOT_COLORS: Record<MilestoneStatus, string> = {
  completed: "bg-emerald-400",
  in_progress: "bg-amber-400",
  pending: "bg-gray-500",
  delayed: "bg-red-400",
};

export function StatusBadge({ status }: { status: MilestoneStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "rounded-[10px] px-2 py-0.5 text-[11px]",
        style.bg,
        style.text
      )}
    >
      {style.label}
    </span>
  );
}

export function StatusDot({ status }: { status: MilestoneStatus }) {
  return (
    <div
      className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", DOT_COLORS[status])}
    />
  );
}
```

Create `components/portal/shared/PortalButton.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface PortalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "accent" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function PortalButton({
  children,
  onClick,
  variant = "outline",
  className,
  type = "button",
  disabled = false,
}: PortalButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-3.5 py-1.5 text-[12px] transition-all duration-200",
        variant === "accent"
          ? "bg-champagne font-medium text-[#1A1A1A] hover:bg-champagne-light"
          : "border border-white/15 text-[#e5e5e5] hover:border-white/30",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 7: Create TokenInvalid component and page**

Create `components/portal/TokenInvalid.tsx`:

```tsx
import Link from "next/link";

export default function TokenInvalid() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <div className="max-w-md px-6 text-center">
        <div className="mb-4 text-[48px] font-extralight text-white">
          Link Expired
        </div>
        <p className="mb-8 text-[17px] leading-relaxed text-[#86868B]">
          This portal link is no longer active. It may have been revoked or
          expired. Please contact Ownera Capital for a new link.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-champagne px-6 py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
```

Create `app/portal/invalid/page.tsx`:

```tsx
import TokenInvalid from "@/components/portal/TokenInvalid";

export default function InvalidPortalPage() {
  return <TokenInvalid />;
}
```

- [ ] **Step 8: Commit**

```bash
git add app/ components/portal/
git commit -m "feat: add portal layout shell, sidebar, and shared components"
```

---

## Task 5: Team Portal — Token Layout & Dashboard

**Files:**
- Create: `app/portal/team/[token]/layout.tsx`
- Create: `app/portal/team/[token]/page.tsx`

- [ ] **Step 1: Create team token layout with validation**

Create `app/portal/team/[token]/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";

export default async function TeamTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServerSupabase();

  const { data: link } = await supabase
    .from("portal_links")
    .select("*, projects(*)")
    .eq("token", token)
    .eq("type", "team")
    .eq("is_active", true)
    .single();

  if (!link || (link.expires_at && new Date(link.expires_at) < new Date())) {
    redirect("/portal/invalid");
  }

  const projectName = link.projects?.name ?? "Portal";

  return (
    <PortalShell portalType="team" token={token} projectName={projectName}>
      {children}
    </PortalShell>
  );
}
```

- [ ] **Step 2: Create team dashboard page**

Create `app/portal/team/[token]/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken } from "@/lib/portal/queries";
import { getGanttTasks, getMilestones, getStatusUpdates, getFundMetrics } from "@/lib/portal/queries";
import { formatShortDate, getQuarterLabel } from "@/lib/portal/utils";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import PortalButton from "@/components/portal/shared/PortalButton";
import Link from "next/link";
import type { GanttTask, Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

export default function TeamDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);

      const [t, m, u, f] = await Promise.all([
        getGanttTasks(link.project_id),
        getMilestones(link.project_id),
        getStatusUpdates(link.project_id),
        getFundMetrics(link.project_id),
      ]);
      setTasks(t.filter((task) => !task.parent_id));
      setMilestones(m.slice(0, 5));
      setUpdates(u.slice(0, 1));
      setMetrics(f);
    }
    load();
  }, [token]);

  const basePath = `/portal/team/${token}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#86868B]">{getQuarterLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${basePath}/gantt`}>
            <PortalButton variant="accent">+ Add Task</PortalButton>
          </Link>
          <Link href={`${basePath}/updates`}>
            <PortalButton>+ Update</PortalButton>
          </Link>
        </div>
      </div>

      {/* Gantt Preview */}
      <section className="mb-8">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
          Pipeline Overview
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#86868B]">
              No tasks yet.{" "}
              <Link href={`${basePath}/gantt`} className="text-champagne hover:underline">
                Add your first task
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const barColor =
                  task.color ?? (task.progress === 100 ? "#10B981" : "#3B82F6");
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <span className="w-[140px] truncate text-right text-[12px] text-[#86868B]">
                      {task.title}
                    </span>
                    <div className="relative h-6 flex-1 rounded bg-white/[0.03]">
                      <div
                        className="absolute left-0 top-0 h-full rounded"
                        style={{
                          width: `${task.progress}%`,
                          background: barColor,
                          minWidth: task.progress > 0 ? "8px" : "0",
                        }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white/70">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Milestones
          </div>
          <Link
            href={`${basePath}/milestones`}
            className="text-[12px] text-[#86868B] hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-1">
          {milestones.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-[#86868B]">
              No milestones yet.
            </p>
          ) : (
            milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3"
              >
                <StatusDot status={m.status} />
                <span className="flex-1 text-[13px] text-[#e5e5e5]">
                  {m.title}
                </span>
                <StatusBadge status={m.status} />
                <span className="text-[11px] text-[#86868B]">
                  {formatShortDate(m.due_date)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Latest Update */}
      {updates.length > 0 && (
        <section>
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Latest Update
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-1 text-[15px] font-medium text-white">
              {updates[0].title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#86868B]">
              {updates[0].body}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run the dev server and verify team dashboard loads**

```bash
cd "C:/Users/volko/Desktop/MBO Fund Exercise/mbo-fund-website"
npm run dev
```

Navigate to `http://localhost:3000/portal/team/team-abc12345`. Verify:
- Sidebar renders with all team nav items
- Dashboard shows empty state (no tasks/milestones yet)
- No Navbar/Footer from the marketing site

Also verify `http://localhost:3000` still works (marketing site with Navbar/Footer).

- [ ] **Step 4: Commit**

```bash
git add app/portal/team/
git commit -m "feat: add team portal token layout and dashboard page"
```

---

## Task 6: Team Portal — Interactive Gantt Chart

**Files:**
- Create: `components/portal/gantt/GanttChart.tsx`
- Create: `components/portal/gantt/GanttBar.tsx`
- Create: `components/portal/gantt/GanttTaskRow.tsx`
- Create: `components/portal/gantt/GanttMilestone.tsx`
- Create: `components/portal/gantt/GanttToolbar.tsx`
- Create: `app/portal/team/[token]/gantt/page.tsx`

- [ ] **Step 1: Create GanttToolbar**

Create `components/portal/gantt/GanttToolbar.tsx`:

```tsx
"use client";

import PortalButton from "@/components/portal/shared/PortalButton";
import { cn } from "@/lib/utils";

type TimeScale = "month" | "quarter" | "year";

interface GanttToolbarProps {
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
  onAddTask: () => void;
}

export default function GanttToolbar({
  timeScale,
  onTimeScaleChange,
  onAddTask,
}: GanttToolbarProps) {
  const scales: TimeScale[] = ["month", "quarter", "year"];

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#111] px-6 py-4">
      <h2 className="text-lg font-medium text-white">Gantt Chart</h2>
      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-white/15">
          {scales.map((s) => (
            <button
              key={s}
              onClick={() => onTimeScaleChange(s)}
              className={cn(
                "border-r border-white/10 px-3 py-1.5 text-[12px] capitalize last:border-r-0",
                timeScale === s
                  ? "bg-white/10 text-white"
                  : "text-[#e5e5e5] hover:bg-white/5"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <PortalButton variant="accent" onClick={onAddTask}>
          + Add Task
        </PortalButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create GanttBar**

Create `components/portal/gantt/GanttBar.tsx`:

```tsx
"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GanttBarProps {
  leftPercent: number;
  widthPercent: number;
  progress: number;
  color: string;
  isSubTask?: boolean;
  onDragEnd?: (newLeftPercent: number, newWidthPercent: number) => void;
  onClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  green: "from-emerald-600 to-emerald-400",
  blue: "from-blue-600 to-blue-500",
  amber: "from-amber-600 to-amber-400",
  champagne: "from-champagne to-champagne-light",
};

export default function GanttBar({
  leftPercent,
  widthPercent,
  progress,
  color,
  isSubTask = false,
  onDragEnd,
  onClick,
}: GanttBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    mode: "move" | "resize";
    startX: number;
    startLeft: number;
    startWidth: number;
    parentWidth: number;
  } | null>(null);

  const gradient = COLOR_MAP[color] ?? `from-[${color}] to-[${color}]`;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize") => {
      e.preventDefault();
      e.stopPropagation();
      const bar = barRef.current;
      if (!bar) return;
      const parent = bar.parentElement;
      if (!parent) return;
      parentRef.current = parent;

      bar.setPointerCapture(e.pointerId);
      dragState.current = {
        mode,
        startX: e.clientX,
        startLeft: leftPercent,
        startWidth: widthPercent,
        parentWidth: parent.getBoundingClientRect().width,
      };
    },
    [leftPercent, widthPercent]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const deltaX = e.clientX - ds.startX;
    const deltaPct = (deltaX / ds.parentWidth) * 100;

    const bar = barRef.current;
    if (!bar) return;

    if (ds.mode === "move") {
      const newLeft = Math.max(0, Math.min(100 - ds.startWidth, ds.startLeft + deltaPct));
      bar.style.left = `${newLeft}%`;
    } else {
      const newWidth = Math.max(2, ds.startWidth + deltaPct);
      bar.style.width = `${newWidth}%`;
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      dragState.current = null;

      const bar = barRef.current;
      if (!bar) return;
      bar.releasePointerCapture(e.pointerId);

      const deltaX = e.clientX - ds.startX;
      const deltaPct = (deltaX / ds.parentWidth) * 100;

      if (ds.mode === "move") {
        const newLeft = Math.max(0, Math.min(100 - ds.startWidth, ds.startLeft + deltaPct));
        onDragEnd?.(newLeft, ds.startWidth);
      } else {
        const newWidth = Math.max(2, ds.startWidth + deltaPct);
        onDragEnd?.(ds.startLeft, newWidth);
      }
    },
    [onDragEnd]
  );

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute flex cursor-grab items-center justify-between rounded-md bg-gradient-to-r px-2 text-[10px] transition-shadow duration-200 hover:shadow-[0_0_0_2px_rgba(196,176,137,0.4)]",
        gradient,
        isSubTask ? "top-[13px] h-[18px] opacity-80" : "top-[9px] h-[26px]",
        color === "champagne" || color === "amber" ? "text-[#1A1A1A]" : "text-white/80"
      )}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }}
      onClick={onClick}
      onPointerDown={(e) => handlePointerDown(e, "move")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="font-medium">{progress}%</span>
      {!isSubTask && (
        <div
          className="h-4 w-1.5 cursor-ew-resize rounded-sm bg-white/20"
          onPointerDown={(e) => {
            e.stopPropagation();
            handlePointerDown(e, "resize");
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create GanttMilestone**

Create `components/portal/gantt/GanttMilestone.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface GanttMilestoneProps {
  leftPercent: number;
  completed: boolean;
}

export default function GanttMilestone({
  leftPercent,
  completed,
}: GanttMilestoneProps) {
  return (
    <div
      className={cn(
        "absolute top-[13px] h-[18px] w-[18px] rotate-45 rounded-[3px] border-2 border-champagne",
        completed ? "bg-champagne" : "bg-[#1A1A1A]"
      )}
      style={{ left: `${leftPercent}%` }}
    />
  );
}
```

- [ ] **Step 4: Create GanttTaskRow**

Create `components/portal/gantt/GanttTaskRow.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { GanttTask } from "@/lib/portal/types";
import GanttBar from "./GanttBar";

interface GanttTaskRowProps {
  task: GanttTask;
  isParent: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  leftPercent: number;
  widthPercent: number;
  barColor: string;
  lpVisible: boolean;
  onBarDragEnd?: (newLeft: number, newWidth: number) => void;
  onBarClick?: () => void;
}

export default function GanttTaskRow({
  task,
  isParent,
  isExpanded,
  onToggleExpand,
  leftPercent,
  widthPercent,
  barColor,
  lpVisible,
  onBarDragEnd,
  onBarClick,
}: GanttTaskRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[44px] items-center border-b border-white/[0.03] transition-colors",
        isParent && "bg-white/[0.02]",
        "hover:bg-white/[0.02]"
      )}
    >
      {/* Task info */}
      <div className="flex w-[220px] flex-shrink-0 items-center gap-2 px-4 py-2">
        {isParent ? (
          <button
            onClick={onToggleExpand}
            className="flex h-4 w-4 items-center justify-center text-[10px] text-[#86868B]"
          >
            {isExpanded ? "▼" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span
          className={cn(
            "text-[13px]",
            isParent ? "text-[#e5e5e5]" : "pl-3 text-[12px] text-[#9CA3AF]"
          )}
        >
          {task.title}
        </span>
        {lpVisible && (
          <span className="ml-1 rounded bg-champagne/15 px-1.5 py-0.5 text-[10px] text-champagne">
            LP
          </span>
        )}
      </div>

      {/* Track area */}
      <div className="relative h-[44px] flex-1">
        <GanttBar
          leftPercent={leftPercent}
          widthPercent={widthPercent}
          progress={task.progress}
          color={barColor}
          isSubTask={!isParent}
          onDragEnd={onBarDragEnd}
          onClick={onBarClick}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create GanttChart container**

Create `components/portal/gantt/GanttChart.tsx`:

```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { GanttTask } from "@/lib/portal/types";
import { dateToPercent, percentToDate } from "@/lib/portal/utils";
import { updateGanttTask, createGanttTask } from "@/lib/portal/queries";
import GanttToolbar from "./GanttToolbar";
import GanttTaskRow from "./GanttTaskRow";
import GanttMilestone from "./GanttMilestone";

type TimeScale = "month" | "quarter" | "year";

interface GanttChartProps {
  tasks: GanttTask[];
  projectId: string;
  onTasksChange: (tasks: GanttTask[]) => void;
}

function getTimeRange(tasks: GanttTask[], scale: TimeScale): { start: Date; end: Date; columns: { label: string; start: Date }[] } {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (scale === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31);
  } else if (scale === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3 - 3, 1);
    end = new Date(now.getFullYear(), q * 3 + 6, 0);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth() + 5, 0);
  }

  // Extend range to fit tasks
  for (const t of tasks) {
    const ts = new Date(t.start_date);
    const te = new Date(t.end_date);
    if (ts < start) start = new Date(ts.getFullYear(), ts.getMonth(), 1);
    if (te > end) end = new Date(te.getFullYear(), te.getMonth() + 1, 0);
  }

  const columns: { label: string; start: Date }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const label = cursor.toLocaleDateString("en-US", {
      month: "short",
      year: scale === "year" ? undefined : "numeric",
    });
    columns.push({ label, start: new Date(cursor) });
    cursor.setMonth(cursor.getMonth() + (scale === "quarter" ? 3 : 1));
  }

  return { start, end, columns };
}

const DEFAULT_COLORS = ["green", "blue", "amber", "champagne"];

export default function GanttChart({
  tasks,
  projectId,
  onTasksChange,
}: GanttChartProps) {
  const [timeScale, setTimeScale] = useState<TimeScale>("month");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(tasks.filter((t) => !t.parent_id).map((t) => t.id)));
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const parentTasks = useMemo(() => tasks.filter((t) => !t.parent_id), [tasks]);
  const childMap = useMemo(() => {
    const map = new Map<string, GanttTask[]>();
    for (const t of tasks) {
      if (t.parent_id) {
        const children = map.get(t.parent_id) ?? [];
        children.push(t);
        map.set(t.parent_id, children);
      }
    }
    return map;
  }, [tasks]);

  const { start: rangeStart, end: rangeEnd, columns } = getTimeRange(tasks, timeScale);

  const todayPercent = dateToPercent(new Date().toISOString().split("T")[0], rangeStart, rangeEnd);

  const handleDragEnd = useCallback(
    async (task: GanttTask, newLeft: number, newWidth: number) => {
      const newStart = percentToDate(newLeft, rangeStart, rangeEnd);
      const newEnd = percentToDate(newLeft + newWidth, rangeStart, rangeEnd);
      const startStr = newStart.toISOString().split("T")[0];
      const endStr = newEnd.toISOString().split("T")[0];

      // Optimistic update
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, start_date: startStr, end_date: endStr } : t
      );
      onTasksChange(updated);

      await updateGanttTask(task.id, { start_date: startStr, end_date: endStr });
    },
    [tasks, rangeStart, rangeEnd, onTasksChange]
  );

  const handleAddTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const task = await createGanttTask({
      project_id: projectId,
      title: newTaskTitle.trim(),
      start_date: now.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      sort_order: parentTasks.length,
      color: DEFAULT_COLORS[parentTasks.length % DEFAULT_COLORS.length],
    });

    if (task) {
      onTasksChange([...tasks, task]);
      setExpanded((prev) => new Set(prev).add(task.id));
    }
    setNewTaskTitle("");
    setAddingTask(false);
  }, [newTaskTitle, projectId, parentTasks.length, tasks, onTasksChange]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <GanttToolbar
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        onAddTask={() => setAddingTask(true)}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Column headers */}
          <div className="flex border-b border-white/[0.06] pb-2 pl-[220px] pt-3">
            {columns.map((col, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[11px] uppercase tracking-wider text-[#86868B]">
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* Task rows */}
          {parentTasks.map((task, idx) => {
            const color = task.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const left = dateToPercent(task.start_date, rangeStart, rangeEnd);
            const right = dateToPercent(task.end_date, rangeStart, rangeEnd);
            const width = Math.max(2, right - left);
            const isExp = expanded.has(task.id);
            const children = childMap.get(task.id) ?? [];

            return (
              <div key={task.id}>
                <GanttTaskRow
                  task={task}
                  isParent={true}
                  isExpanded={isExp}
                  onToggleExpand={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(task.id)) next.delete(task.id);
                      else next.add(task.id);
                      return next;
                    });
                  }}
                  leftPercent={left}
                  widthPercent={width}
                  barColor={color}
                  lpVisible={task.lp_visible}
                  onBarDragEnd={(l, w) => handleDragEnd(task, l, w)}
                />
                {isExp &&
                  children.map((child) => {
                    const cl = dateToPercent(child.start_date, rangeStart, rangeEnd);
                    const cr = dateToPercent(child.end_date, rangeStart, rangeEnd);
                    return (
                      <GanttTaskRow
                        key={child.id}
                        task={child}
                        isParent={false}
                        leftPercent={cl}
                        widthPercent={Math.max(2, cr - cl)}
                        barColor={color}
                        lpVisible={child.lp_visible}
                        onBarDragEnd={(l, w) => handleDragEnd(child, l, w)}
                      />
                    );
                  })}
              </div>
            );
          })}

          {/* Add task inline */}
          {addingTask && (
            <div className="flex items-center border-b border-white/[0.03] px-4 py-2">
              <div className="flex w-[220px] items-center gap-2">
                <span className="w-4" />
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                    if (e.key === "Escape") setAddingTask(false);
                  }}
                  placeholder="Task name..."
                  className="w-full rounded bg-transparent text-[13px] text-white outline-none placeholder:text-[#4B5563]"
                />
              </div>
              <div className="flex gap-2 pl-4">
                <button
                  onClick={handleAddTask}
                  className="rounded bg-champagne px-2 py-0.5 text-[11px] font-medium text-[#1A1A1A]"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTask(false)}
                  className="text-[11px] text-[#86868B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Today line overlay */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-red-500"
            style={{ left: `calc(220px + ${todayPercent}% * (100% - 220px) / 100)` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 border-t border-white/[0.06] px-6 py-3">
        {DEFAULT_COLORS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
            <div
              className={`h-3 w-3 rounded-sm ${
                c === "green" ? "bg-emerald-400" :
                c === "blue" ? "bg-blue-500" :
                c === "amber" ? "bg-amber-400" : "bg-champagne"
              }`}
            />
            <span className="capitalize">{c === "champagne" ? "Close" : c === "green" ? "Sourcing" : c === "blue" ? "DD" : "Structuring"}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <div className="h-3 w-3 rotate-45 rounded-sm border-2 border-champagne" />
          Milestone
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-red-400">
          │ Today
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create Gantt page**

Create `app/portal/team/[token]/gantt/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getGanttTasks } from "@/lib/portal/queries";
import GanttChart from "@/components/portal/gantt/GanttChart";
import type { GanttTask } from "@/lib/portal/types";

export default function GanttPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getGanttTasks(link.project_id);
      setTasks(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <GanttChart
        tasks={tasks}
        projectId={projectId!}
        onTasksChange={setTasks}
      />
    </div>
  );
}
```

- [ ] **Step 7: Test Gantt in browser**

Navigate to `http://localhost:3000/portal/team/team-abc12345/gantt`. Verify:
- Empty state shows with "Add Task" button
- Adding a task creates a bar on the timeline
- Bars are draggable
- Time scale toggle works

- [ ] **Step 8: Commit**

```bash
git add components/portal/gantt/ app/portal/team/*/gantt/
git commit -m "feat: add interactive Gantt chart for team portal"
```

---

## Task 7: Team Portal — Milestones Page

**Files:**
- Create: `components/portal/milestones/MilestoneList.tsx`
- Create: `components/portal/milestones/MilestoneRow.tsx`
- Create: `app/portal/team/[token]/milestones/page.tsx`

- [ ] **Step 1: Create MilestoneRow**

Create `components/portal/milestones/MilestoneRow.tsx`:

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Milestone, MilestoneStatus } from "@/lib/portal/types";
import { formatShortDate } from "@/lib/portal/utils";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import { updateMilestone } from "@/lib/portal/queries";

interface MilestoneRowProps {
  milestone: Milestone;
  editable: boolean;
  onUpdate: (updated: Milestone) => void;
}

const STATUSES: MilestoneStatus[] = ["pending", "in_progress", "completed", "delayed"];

export default function MilestoneRow({
  milestone,
  editable,
  onUpdate,
}: MilestoneRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(milestone.title);
  const [status, setStatus] = useState(milestone.status);
  const [dueDate, setDueDate] = useState(milestone.due_date);

  const handleSave = async () => {
    const updated = await updateMilestone(milestone.id, { title, status, due_date: dueDate });
    if (updated) onUpdate(updated);
    setEditing(false);
  };

  const handleVisibilityToggle = async (visible: boolean) => {
    const updated = await updateMilestone(milestone.id, { lp_visible: visible });
    if (updated) onUpdate(updated);
  };

  const handleStatusCycle = async () => {
    if (!editable) return;
    const idx = STATUSES.indexOf(milestone.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    const updated = await updateMilestone(milestone.id, { status: next });
    if (updated) {
      setStatus(next);
      onUpdate(updated);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
        />
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
            className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[12px] text-[#86868B]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3 transition-colors hover:border-white/[0.08]">
      <StatusDot status={milestone.status} />
      <span
        className={cn(
          "flex-1 text-[13px] text-[#e5e5e5]",
          editable && "cursor-pointer hover:text-white"
        )}
        onClick={() => editable && setEditing(true)}
      >
        {milestone.title}
      </span>
      {editable && (
        <VisibilityToggle
          isVisible={milestone.lp_visible}
          onToggle={handleVisibilityToggle}
        />
      )}
      <button onClick={handleStatusCycle}>
        <StatusBadge status={milestone.status} />
      </button>
      <span className="text-[11px] text-[#86868B]">
        {formatShortDate(milestone.due_date)}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create MilestoneList**

Create `components/portal/milestones/MilestoneList.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Milestone } from "@/lib/portal/types";
import { createMilestone } from "@/lib/portal/queries";
import MilestoneRow from "./MilestoneRow";
import PortalButton from "@/components/portal/shared/PortalButton";

interface MilestoneListProps {
  milestones: Milestone[];
  projectId: string;
  editable: boolean;
  onMilestonesChange: (milestones: Milestone[]) => void;
}

export default function MilestoneList({
  milestones,
  projectId,
  editable,
  onMilestonesChange,
}: MilestoneListProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return;
    const m = await createMilestone({
      project_id: projectId,
      title: newTitle.trim(),
      due_date: newDate,
      sort_order: milestones.length,
    });
    if (m) {
      onMilestonesChange([...milestones, m]);
    }
    setNewTitle("");
    setNewDate("");
    setAdding(false);
  };

  const handleUpdate = (updated: Milestone) => {
    onMilestonesChange(
      milestones.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Milestones</h2>
        {editable && (
          <PortalButton variant="accent" onClick={() => setAdding(true)}>
            + Add Milestone
          </PortalButton>
        )}
      </div>

      <div className="space-y-1.5">
        {milestones.map((m) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            editable={editable}
            onUpdate={handleUpdate}
          />
        ))}

        {milestones.length === 0 && !adding && (
          <p className="py-8 text-center text-[13px] text-[#86868B]">
            No milestones yet. Click "+ Add Milestone" to get started.
          </p>
        )}

        {adding && (
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Milestone title..."
              className="flex-1 rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#4B5563]"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none"
            />
            <button
              onClick={handleAdd}
              className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]"
            >
              Add
            </button>
            <button
              onClick={() => setAdding(false)}
              className="text-[12px] text-[#86868B]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create team milestones page**

Create `app/portal/team/[token]/milestones/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getMilestones } from "@/lib/portal/queries";
import MilestoneList from "@/components/portal/milestones/MilestoneList";
import type { Milestone } from "@/lib/portal/types";

export default function TeamMilestonesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getMilestones(link.project_id);
      setMilestones(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <MilestoneList
      milestones={milestones}
      projectId={projectId!}
      editable={true}
      onMilestonesChange={setMilestones}
    />
  );
}
```

- [ ] **Step 4: Test milestones page**

Navigate to `http://localhost:3000/portal/team/team-abc12345/milestones`. Verify:
- Add milestone works (title + date)
- Click title to edit inline
- Click status badge to cycle through statuses
- LP visibility toggle works

- [ ] **Step 5: Commit**

```bash
git add components/portal/milestones/ app/portal/team/*/milestones/
git commit -m "feat: add milestones management for team portal"
```

---

## Task 8: Team Portal — Status Updates Page

**Files:**
- Create: `components/portal/updates/StatusUpdateList.tsx`
- Create: `components/portal/updates/StatusUpdateEditor.tsx`
- Create: `app/portal/team/[token]/updates/page.tsx`

- [ ] **Step 1: Create StatusUpdateEditor**

Create `components/portal/updates/StatusUpdateEditor.tsx`:

```tsx
"use client";

import { useState } from "react";
import PortalButton from "@/components/portal/shared/PortalButton";

interface StatusUpdateEditorProps {
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
}

export default function StatusUpdateEditor({
  onSave,
  onCancel,
}: StatusUpdateEditorProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Update title..."
        className="mb-3 w-full rounded bg-white/5 px-3 py-2 text-[15px] font-medium text-white outline-none placeholder:text-[#4B5563] focus:ring-1 focus:ring-champagne/50"
      />

      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setPreview(false)}
          className={`text-[12px] ${!preview ? "text-white" : "text-[#86868B]"}`}
        >
          Write
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`text-[12px] ${preview ? "text-white" : "text-[#86868B]"}`}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div className="min-h-[120px] rounded bg-white/5 p-4 text-[14px] leading-relaxed text-[#e5e5e5] whitespace-pre-wrap">
          {body || "Nothing to preview."}
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your update... (plain text)"
          rows={6}
          className="w-full resize-y rounded bg-white/5 px-3 py-2 text-[14px] leading-relaxed text-white outline-none placeholder:text-[#4B5563] focus:ring-1 focus:ring-champagne/50"
        />
      )}

      <div className="mt-4 flex gap-2">
        <PortalButton
          variant="accent"
          onClick={() => {
            if (title.trim() && body.trim()) onSave(title.trim(), body.trim());
          }}
          disabled={!title.trim() || !body.trim()}
        >
          Publish Update
        </PortalButton>
        <PortalButton onClick={onCancel}>Cancel</PortalButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create StatusUpdateList**

Create `components/portal/updates/StatusUpdateList.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { StatusUpdate } from "@/lib/portal/types";
import { createStatusUpdate, updateStatusUpdate, deleteStatusUpdate } from "@/lib/portal/queries";
import { formatDate } from "@/lib/portal/utils";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import StatusUpdateEditor from "./StatusUpdateEditor";
import PortalButton from "@/components/portal/shared/PortalButton";

interface StatusUpdateListProps {
  updates: StatusUpdate[];
  projectId: string;
  editable: boolean;
  onUpdatesChange: (updates: StatusUpdate[]) => void;
}

export default function StatusUpdateList({
  updates,
  projectId,
  editable,
  onUpdatesChange,
}: StatusUpdateListProps) {
  const [adding, setAdding] = useState(false);

  const handleSave = async (title: string, body: string) => {
    const update = await createStatusUpdate({ project_id: projectId, title, body });
    if (update) {
      onUpdatesChange([update, ...updates]);
    }
    setAdding(false);
  };

  const handleVisibilityToggle = async (updateId: string, visible: boolean) => {
    const updated = await updateStatusUpdate(updateId, { lp_visible: visible });
    if (updated) {
      onUpdatesChange(updates.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const handleDelete = async (updateId: string) => {
    const ok = await deleteStatusUpdate(updateId);
    if (ok) {
      onUpdatesChange(updates.filter((u) => u.id !== updateId));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Status Updates</h2>
        {editable && !adding && (
          <PortalButton variant="accent" onClick={() => setAdding(true)}>
            + New Update
          </PortalButton>
        )}
      </div>

      {adding && (
        <div className="mb-6">
          <StatusUpdateEditor
            onSave={handleSave}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-white">
                {update.title}
              </h3>
              <div className="flex items-center gap-3">
                {editable && (
                  <>
                    <VisibilityToggle
                      isVisible={update.lp_visible}
                      onToggle={(v) => handleVisibilityToggle(update.id, v)}
                      label="LP"
                    />
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="text-[11px] text-[#86868B] hover:text-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
                <span className="text-[11px] text-[#86868B]">
                  {formatDate(update.created_at)}
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-[#86868B] whitespace-pre-wrap">
              {update.body}
            </p>
          </div>
        ))}

        {updates.length === 0 && !adding && (
          <p className="py-8 text-center text-[13px] text-[#86868B]">
            No updates yet. Click "+ New Update" to publish your first update.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create team updates page**

Create `app/portal/team/[token]/updates/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getStatusUpdates } from "@/lib/portal/queries";
import StatusUpdateList from "@/components/portal/updates/StatusUpdateList";
import type { StatusUpdate } from "@/lib/portal/types";

export default function TeamUpdatesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getStatusUpdates(link.project_id);
      setUpdates(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <StatusUpdateList
      updates={updates}
      projectId={projectId!}
      editable={true}
      onUpdatesChange={setUpdates}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/portal/updates/ app/portal/team/*/updates/
git commit -m "feat: add status updates page for team portal"
```

---

## Task 9: Team Portal — Documents Page

**Files:**
- Create: `components/portal/documents/DocumentRow.tsx`
- Create: `components/portal/documents/VersionHistory.tsx`
- Create: `components/portal/documents/DocumentFolder.tsx`
- Create: `components/portal/documents/FileUploadZone.tsx`
- Create: `components/portal/documents/DocumentBrowser.tsx`
- Create: `app/portal/team/[token]/documents/page.tsx`
- Create: `app/api/portal/upload/route.ts`

- [ ] **Step 1: Create DocumentRow**

Create `components/portal/documents/DocumentRow.tsx`:

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Document } from "@/lib/portal/types";
import { formatFileSize, formatDate, getFileTypeInfo } from "@/lib/portal/utils";
import { getPublicUrl } from "@/lib/supabase/storage";
import VersionHistory from "./VersionHistory";

interface DocumentRowProps {
  document: Document;
  editable: boolean;
  onReplace?: (file: File) => void;
}

export default function DocumentRow({
  document: doc,
  editable,
  onReplace,
}: DocumentRowProps) {
  const [showVersions, setShowVersions] = useState(false);
  const typeInfo = getFileTypeInfo(doc.mime_type);
  const url = getPublicUrl(doc.storage_path);

  return (
    <>
      <div className="flex items-center rounded-[10px] border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04]">
        {/* Type icon */}
        <div
          className={cn(
            "mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[14px]",
            typeInfo.colorClass
          )}
        >
          {typeInfo.label}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="text-[14px] text-[#e5e5e5]">{doc.name}</div>
          <div className="mt-0.5 flex gap-3 text-[11px] text-[#86868B]">
            <span>{formatFileSize(doc.file_size)}</span>
            <span>{formatDate(doc.updated_at)}</span>
            {doc.uploaded_by && <span>by {doc.uploaded_by}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px]",
              doc.version > 1
                ? "bg-champagne/15 text-champagne"
                : "bg-white/[0.06] text-[#86868B]"
            )}
          >
            v{doc.version}{doc.version > 1 ? " latest" : ""}
          </span>

          {doc.version > 1 && (
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]"
              title="Version history"
            >
              ↕
            </button>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]"
            title="Download"
          >
            ↓
          </a>

          {editable && onReplace && (
            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]" title="Replace">
              ⟳
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onReplace(f);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {showVersions && (
        <VersionHistory documentId={doc.id} currentVersion={doc.version} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create VersionHistory**

Create `components/portal/documents/VersionHistory.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { getDocumentVersions } from "@/lib/portal/queries";
import { getPublicUrl } from "@/lib/supabase/storage";
import { formatDate } from "@/lib/portal/utils";
import type { DocumentVersion } from "@/lib/portal/types";

interface VersionHistoryProps {
  documentId: string;
  currentVersion: number;
}

export default function VersionHistory({
  documentId,
  currentVersion,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  useEffect(() => {
    getDocumentVersions(documentId).then(setVersions);
  }, [documentId]);

  return (
    <div className="-mt-0.5 mb-1.5 rounded-b-[10px] border border-t-0 border-white/[0.04] bg-white/[0.015] px-4 py-3 pl-16">
      {versions.map((v) => (
        <div
          key={v.id}
          className="flex items-center gap-3 border-b border-white/[0.03] py-1.5 last:border-b-0"
        >
          <span className="w-7 text-[12px] text-[#86868B]">v{v.version}</span>
          <span className="text-[12px] text-[#86868B]">
            {formatDate(v.created_at)}
          </span>
          {v.uploaded_by && (
            <span className="text-[12px] text-[#6B6560]">{v.uploaded_by}</span>
          )}
          {v.version === currentVersion && (
            <span className="text-[10px] text-emerald-400">Current</span>
          )}
          <a
            href={getPublicUrl(v.storage_path)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[11px] text-champagne hover:underline"
          >
            Download
          </a>
        </div>
      ))}
      {versions.length === 0 && (
        <p className="text-[12px] text-[#86868B]">No previous versions.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create FileUploadZone**

Create `components/portal/documents/FileUploadZone.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploadZone({ onFilesSelected }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "mt-3 rounded-xl border-2 border-dashed px-8 py-8 text-center transition-colors",
        dragging
          ? "border-champagne/40 bg-champagne/5"
          : "border-white/10 hover:border-white/20"
      )}
    >
      <div className="mb-2 text-2xl text-[#86868B]">⇧</div>
      <div className="text-[14px] text-[#86868B]">
        Drop files here or{" "}
        <label className="cursor-pointer text-champagne hover:underline">
          browse
          <input
            type="file"
            className="hidden"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length > 0) onFilesSelected(files);
            }}
          />
        </label>
      </div>
      <div className="mt-1 text-[11px] text-[#4B5563]">
        PDF, XLSX, PPTX, DOCX — up to 50 MB per file
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create DocumentFolder**

Create `components/portal/documents/DocumentFolder.tsx`:

```tsx
"use client";

import type { DocumentFolder as FolderType, Document } from "@/lib/portal/types";
import { updateDocumentFolder } from "@/lib/portal/queries";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import DocumentRow from "./DocumentRow";

interface DocumentFolderProps {
  folder: FolderType;
  documents: Document[];
  editable: boolean;
  onFolderUpdate: (folder: FolderType) => void;
  onDocumentReplace: (docId: string, file: File) => void;
}

export default function DocumentFolderComponent({
  folder,
  documents,
  editable,
  onFolderUpdate,
  onDocumentReplace,
}: DocumentFolderProps) {
  const handleVisibilityToggle = async (visible: boolean) => {
    const updated = await updateDocumentFolder(folder.id, {
      lp_visible: visible,
    });
    if (updated) onFolderUpdate(updated);
  };

  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📁</span>
          <span className="text-[15px] font-medium text-white">
            {folder.name}
          </span>
          <span className="rounded-[10px] bg-white/[0.06] px-2 py-0.5 text-[11px] text-[#86868B]">
            {documents.length} file{documents.length !== 1 ? "s" : ""}
          </span>
        </div>
        {editable && (
          <VisibilityToggle
            isVisible={folder.lp_visible}
            onToggle={handleVisibilityToggle}
            label={folder.lp_visible ? "LP visible" : "Internal only"}
          />
        )}
      </div>

      <div className="space-y-1.5">
        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            document={doc}
            editable={editable}
            onReplace={(file) => onDocumentReplace(doc.id, file)}
          />
        ))}
        {documents.length === 0 && (
          <p className="py-3 text-center text-[12px] text-[#4B5563]">
            No files in this folder.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create DocumentBrowser**

Create `components/portal/documents/DocumentBrowser.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { DocumentFolder, Document } from "@/lib/portal/types";
import {
  createDocumentFolder,
  createDocument,
  replaceDocumentVersion,
} from "@/lib/portal/queries";
import { uploadFile } from "@/lib/supabase/storage";
import DocumentFolderComponent from "./DocumentFolder";
import FileUploadZone from "./FileUploadZone";
import PortalButton from "@/components/portal/shared/PortalButton";

interface DocumentBrowserProps {
  folders: DocumentFolder[];
  projectId: string;
  editable: boolean;
  onFoldersChange: (folders: DocumentFolder[]) => void;
}

export default function DocumentBrowser({
  folders,
  projectId,
  editable,
  onFoldersChange,
}: DocumentBrowserProps) {
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder = await createDocumentFolder({
      project_id: projectId,
      name: newFolderName.trim(),
      sort_order: folders.length,
    });
    if (folder) {
      onFoldersChange([...folders, { ...folder, documents: [] }]);
    }
    setNewFolderName("");
    setAddingFolder(false);
  };

  const handleFolderUpdate = (updated: DocumentFolder) => {
    onFoldersChange(
      folders.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
    );
  };

  const handleUploadToFirstFolder = async (files: File[]) => {
    if (folders.length === 0) return;
    const targetFolder = folders[0];
    setUploading(true);

    for (const file of files) {
      const { path, error } = await uploadFile(projectId, targetFolder.id, file);
      if (error || !path) continue;

      const doc = await createDocument({
        folder_id: targetFolder.id,
        name: file.name,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
        uploaded_by: "Team",
      });

      if (doc) {
        onFoldersChange(
          folders.map((f) =>
            f.id === targetFolder.id
              ? { ...f, documents: [...(f.documents ?? []), doc] }
              : f
          )
        );
      }
    }
    setUploading(false);
  };

  const handleDocumentReplace = async (docId: string, file: File) => {
    // Find which folder the doc is in
    const folder = folders.find((f) =>
      f.documents?.some((d) => d.id === docId)
    );
    if (!folder) return;

    setUploading(true);
    const { path, error } = await uploadFile(projectId, folder.id, file);
    if (error || !path) {
      setUploading(false);
      return;
    }

    const updated = await replaceDocumentVersion(
      docId,
      path,
      file.size,
      "Team"
    );

    if (updated) {
      onFoldersChange(
        folders.map((f) =>
          f.id === folder.id
            ? {
                ...f,
                documents: f.documents?.map((d) =>
                  d.id === docId ? updated : d
                ),
              }
            : f
        )
      );
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Documents</h2>
        {editable && (
          <div className="flex gap-2">
            <PortalButton onClick={() => setAddingFolder(true)}>
              + New Folder
            </PortalButton>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mb-4 rounded-lg bg-champagne/10 px-4 py-2 text-[13px] text-champagne">
          Uploading...
        </div>
      )}

      {addingFolder && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
          <span className="text-lg">📁</span>
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="flex-1 rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none placeholder:text-[#4B5563]"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddFolder();
              if (e.key === "Escape") setAddingFolder(false);
            }}
          />
          <button
            onClick={handleAddFolder}
            className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]"
          >
            Create
          </button>
          <button
            onClick={() => setAddingFolder(false)}
            className="text-[12px] text-[#86868B]"
          >
            Cancel
          </button>
        </div>
      )}

      {folders.map((folder) => (
        <DocumentFolderComponent
          key={folder.id}
          folder={folder}
          documents={folder.documents ?? []}
          editable={editable}
          onFolderUpdate={handleFolderUpdate}
          onDocumentReplace={handleDocumentReplace}
        />
      ))}

      {folders.length === 0 && (
        <p className="py-8 text-center text-[13px] text-[#86868B]">
          No folders yet. Click "+ New Folder" to organize your documents.
        </p>
      )}

      {editable && folders.length > 0 && (
        <FileUploadZone onFilesSelected={handleUploadToFirstFolder} />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create team documents page**

Create `app/portal/team/[token]/documents/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getDocumentFolders } from "@/lib/portal/queries";
import DocumentBrowser from "@/components/portal/documents/DocumentBrowser";
import type { DocumentFolder } from "@/lib/portal/types";

export default function TeamDocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getDocumentFolders(link.project_id);
      setFolders(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <DocumentBrowser
      folders={folders}
      projectId={projectId!}
      editable={true}
      onFoldersChange={setFolders}
    />
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/portal/documents/ app/portal/team/*/documents/
git commit -m "feat: add document management with folders, versions, and upload"
```

---

## Task 10: Team Portal — LP Visibility & Fund Metrics

**Files:**
- Create: `components/portal/metrics/FundMetricsGrid.tsx`
- Create: `components/portal/metrics/FundMetricsForm.tsx`
- Create: `app/portal/team/[token]/visibility/page.tsx`

- [ ] **Step 1: Create FundMetricsGrid (read-only display)**

Create `components/portal/metrics/FundMetricsGrid.tsx`:

```tsx
import type { FundMetrics } from "@/lib/portal/types";

interface FundMetricsGridProps {
  metrics: FundMetrics;
}

export default function FundMetricsGrid({ metrics }: FundMetricsGridProps) {
  const items = [
    { value: `$${(metrics.fund_size / 1_000_000).toFixed(0)}M`, label: "Fund Size" },
    { value: `${metrics.capital_deployed_pct}%`, label: "Capital Deployed" },
    { value: String(metrics.deal_count), label: "Active Deals" },
    { value: String(metrics.vintage_year), label: "Vintage Year" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
        >
          <div className="text-[28px] font-light text-white">{item.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-[#86868B]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create FundMetricsForm**

Create `components/portal/metrics/FundMetricsForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { FundMetrics } from "@/lib/portal/types";
import { updateFundMetrics } from "@/lib/portal/queries";
import PortalButton from "@/components/portal/shared/PortalButton";

interface FundMetricsFormProps {
  metrics: FundMetrics;
  onUpdate: (metrics: FundMetrics) => void;
}

export default function FundMetricsForm({
  metrics,
  onUpdate,
}: FundMetricsFormProps) {
  const [fundSize, setFundSize] = useState(String(metrics.fund_size));
  const [deployed, setDeployed] = useState(String(metrics.capital_deployed_pct));
  const [dealCount, setDealCount] = useState(String(metrics.deal_count));
  const [vintage, setVintage] = useState(String(metrics.vintage_year));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateFundMetrics(metrics.project_id, {
      fund_size: Number(fundSize),
      capital_deployed_pct: Number(deployed),
      deal_count: Number(dealCount),
      vintage_year: Number(vintage),
    });
    if (updated) onUpdate(updated);
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[2px] text-champagne">
        Fund Metrics (shown to LPs)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">
            Fund Size ($)
          </label>
          <input
            type="number"
            value={fundSize}
            onChange={(e) => setFundSize(e.target.value)}
            className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">
            Capital Deployed (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={deployed}
            onChange={(e) => setDeployed(e.target.value)}
            className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">
            Deal Count
          </label>
          <input
            type="number"
            value={dealCount}
            onChange={(e) => setDealCount(e.target.value)}
            className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">
            Vintage Year
          </label>
          <input
            type="number"
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
          />
        </div>
      </div>
      <div className="mt-4">
        <PortalButton variant="accent" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Metrics"}
        </PortalButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create LP Visibility page**

Create `app/portal/team/[token]/visibility/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import {
  validateToken,
  getMilestones,
  getGanttTasks,
  getDocumentFolders,
  getStatusUpdates,
  getFundMetrics,
  updateMilestone,
  updateGanttTask,
  updateDocumentFolder,
  updateStatusUpdate,
} from "@/lib/portal/queries";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import FundMetricsForm from "@/components/portal/metrics/FundMetricsForm";
import type {
  Milestone,
  GanttTask,
  DocumentFolder,
  StatusUpdate,
  FundMetrics,
} from "@/lib/portal/types";

export default function VisibilityPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;

      const [m, t, f, u, met] = await Promise.all([
        getMilestones(link.project_id),
        getGanttTasks(link.project_id),
        getDocumentFolders(link.project_id),
        getStatusUpdates(link.project_id),
        getFundMetrics(link.project_id),
      ]);
      setMilestones(m);
      setTasks(t.filter((task) => !task.parent_id));
      setFolders(f);
      setUpdates(u);
      setMetrics(met);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  const toggleMilestone = async (id: string, visible: boolean) => {
    const updated = await updateMilestone(id, { lp_visible: visible });
    if (updated) setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const toggleTask = async (id: string, visible: boolean) => {
    const updated = await updateGanttTask(id, { lp_visible: visible });
    if (updated) setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const toggleFolder = async (id: string, visible: boolean) => {
    const updated = await updateDocumentFolder(id, { lp_visible: visible });
    if (updated) setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };

  const toggleUpdate = async (id: string, visible: boolean) => {
    const updated = await updateStatusUpdate(id, { lp_visible: visible });
    if (updated) setUpdates((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-white">LP Visibility</h2>
        <p className="mt-1 text-[13px] text-[#86868B]">
          Control what investors see on their portal.
        </p>
      </div>

      {/* Fund Metrics */}
      {metrics && (
        <FundMetricsForm metrics={metrics} onUpdate={setMetrics} />
      )}

      {/* Milestones */}
      <Section title="Milestones" count={milestones.filter((m) => m.lp_visible).length} total={milestones.length}>
        {milestones.map((m) => (
          <ToggleRow key={m.id} label={m.title} isVisible={m.lp_visible} onToggle={(v) => toggleMilestone(m.id, v)} />
        ))}
      </Section>

      {/* Gantt Tasks */}
      <Section title="Gantt Tasks" count={tasks.filter((t) => t.lp_visible).length} total={tasks.length}>
        {tasks.map((t) => (
          <ToggleRow key={t.id} label={t.title} isVisible={t.lp_visible} onToggle={(v) => toggleTask(t.id, v)} />
        ))}
      </Section>

      {/* Document Folders */}
      <Section title="Document Folders" count={folders.filter((f) => f.lp_visible).length} total={folders.length}>
        {folders.map((f) => (
          <ToggleRow
            key={f.id}
            label={`${f.name} (${f.documents?.length ?? 0} files)`}
            isVisible={f.lp_visible}
            onToggle={(v) => toggleFolder(f.id, v)}
          />
        ))}
      </Section>

      {/* Status Updates */}
      <Section title="Status Updates" count={updates.filter((u) => u.lp_visible).length} total={updates.length}>
        {updates.map((u) => (
          <ToggleRow key={u.id} label={u.title} isVisible={u.lp_visible} onToggle={(v) => toggleUpdate(u.id, v)} />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  total,
  children,
}: {
  title: string;
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-[2px] text-champagne">
          {title}
        </h3>
        <span className="text-[11px] text-[#86868B]">
          {count}/{total} visible
        </span>
      </div>
      <div className="space-y-1">{children}</div>
      {total === 0 && (
        <p className="py-3 text-[12px] text-[#4B5563]">None created yet.</p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  isVisible,
  onToggle,
}: {
  label: string;
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] px-4 py-2.5">
      <span className="text-[13px] text-[#e5e5e5]">{label}</span>
      <VisibilityToggle isVisible={isVisible} onToggle={onToggle} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/portal/metrics/ app/portal/team/*/visibility/
git commit -m "feat: add LP visibility controls and fund metrics management"
```

---

## Task 11: LP Portal — All Pages

**Files:**
- Create: `app/portal/lp/[token]/layout.tsx`
- Create: `app/portal/lp/[token]/page.tsx`
- Create: `app/portal/lp/[token]/milestones/page.tsx`
- Create: `app/portal/lp/[token]/documents/page.tsx`

- [ ] **Step 1: Create LP token layout**

Create `app/portal/lp/[token]/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";

export default async function LPTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServerSupabase();

  const { data: link } = await supabase
    .from("portal_links")
    .select("*, projects(*)")
    .eq("token", token)
    .eq("type", "lp")
    .eq("is_active", true)
    .single();

  if (!link || (link.expires_at && new Date(link.expires_at) < new Date())) {
    redirect("/portal/invalid");
  }

  const projectName = link.projects?.name ?? "Portal";

  return (
    <PortalShell portalType="lp" token={token} projectName={projectName}>
      {children}
    </PortalShell>
  );
}
```

- [ ] **Step 2: Create LP overview page**

Create `app/portal/lp/[token]/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import {
  validateToken,
  getMilestones,
  getStatusUpdates,
  getFundMetrics,
} from "@/lib/portal/queries";
import { getQuarterLabel, formatShortDate } from "@/lib/portal/utils";
import FundMetricsGrid from "@/components/portal/metrics/FundMetricsGrid";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import type { Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

export default function LPOverviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;

      const [met, mil, upd] = await Promise.all([
        getFundMetrics(link.project_id),
        getMilestones(link.project_id, true),
        getStatusUpdates(link.project_id, true),
      ]);
      setMetrics(met);
      setMilestones(mil.slice(0, 5));
      setUpdates(upd.slice(0, 1));
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-medium text-white">Fund Overview</h1>
        <span className="rounded-full bg-champagne/15 px-3 py-1 text-[11px] text-champagne">
          {getQuarterLabel()}
        </span>
      </div>

      <p className="mb-8 text-[15px] leading-relaxed text-[#86868B]">
        Welcome to the Ownera Capital investor portal. Below is the current fund
        status and key milestones.
      </p>

      {/* Fund Metrics */}
      {metrics && (
        <div className="mb-8">
          <FundMetricsGrid metrics={metrics} />
        </div>
      )}

      {/* Key Milestones */}
      {milestones.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Key Milestones
          </div>
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3"
              >
                <StatusDot status={m.status} />
                <span className="flex-1 text-[13px] text-[#e5e5e5]">
                  {m.title}
                </span>
                <StatusBadge status={m.status} />
                <span className="text-[11px] text-[#86868B]">
                  {formatShortDate(m.due_date)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Update */}
      {updates.length > 0 && (
        <section>
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Latest Update
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-1 text-[15px] font-medium text-white">
              {updates[0].title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#86868B] whitespace-pre-wrap">
              {updates[0].body}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create LP milestones page**

Create `app/portal/lp/[token]/milestones/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getMilestones } from "@/lib/portal/queries";
import MilestoneList from "@/components/portal/milestones/MilestoneList";
import type { Milestone } from "@/lib/portal/types";

export default function LPMilestonesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      const data = await getMilestones(link.project_id, true);
      setMilestones(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <MilestoneList
      milestones={milestones}
      projectId=""
      editable={false}
      onMilestonesChange={setMilestones}
    />
  );
}
```

- [ ] **Step 4: Create LP documents page**

Create `app/portal/lp/[token]/documents/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getDocumentFolders } from "@/lib/portal/queries";
import DocumentBrowser from "@/components/portal/documents/DocumentBrowser";
import type { DocumentFolder } from "@/lib/portal/types";

export default function LPDocumentsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      const data = await getDocumentFolders(link.project_id, true);
      setFolders(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <DocumentBrowser
      folders={folders}
      projectId=""
      editable={false}
      onFoldersChange={setFolders}
    />
  );
}
```

- [ ] **Step 5: Test both portals**

Test team portal: `http://localhost:3000/portal/team/team-abc12345`
Test LP portal: `http://localhost:3000/portal/lp/lp-xyz98765`
Test invalid token: `http://localhost:3000/portal/team/badtoken123`

Verify:
- Team portal: all nav items work, dashboard loads
- LP portal: overview shows metrics, milestones/docs filtered by lp_visible
- Invalid token: redirects to /portal/invalid

- [ ] **Step 6: Commit**

```bash
git add app/portal/lp/
git commit -m "feat: add LP portal with overview, milestones, and documents"
```

---

## Task 12: Build & Polish

**Files:**
- Various existing files for fixes

- [ ] **Step 1: Add .gitignore entries**

Ensure `.gitignore` includes:

```
.env.local
.superpowers/
```

- [ ] **Step 2: Run production build**

```bash
cd "C:/Users/volko/Desktop/MBO Fund Exercise/mbo-fund-website"
npm run build
```

Fix any TypeScript errors or build warnings.

- [ ] **Step 3: Test all routes in production build**

```bash
npm run start
```

Verify:
- `http://localhost:3000` — marketing site works
- `http://localhost:3000/portal/team/team-abc12345` — team portal loads
- `http://localhost:3000/portal/lp/lp-xyz98765` — LP portal loads
- `http://localhost:3000/portal/team/badtoken` — redirects to invalid page

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: dual portal system — team + LP with Gantt, milestones, documents, and visibility controls"
```

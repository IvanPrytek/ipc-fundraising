# Dual Portal — Design Specification

> **Date:** 2026-05-07
> **Status:** Approved
> **Location:** Integrated into `mbo-fund-website` (Approach C)

---

## 1. Overview

A dual-portal system within the existing Next.js app. Two audiences, two link types, one codebase:

- **Team Portal** (`/portal/team/[token]`) — Interactive workspace for the deal team. Editable Gantt, milestones, document management, status updates, and LP visibility controls.
- **LP Portal** (`/portal/lp/[token]`) — Read-only investor portal. Fund metrics, curated milestones, shared documents. Shows only what the team has marked as LP-visible.

No registration. Access is via unique URL tokens. Tokens are generated and revoked from an admin interface or directly in Supabase.

---

## 2. URL Structure & Access Model

| Route | Purpose | Access Level |
|-------|---------|-------------|
| `/portal/team/[token]` | Deal team workspace | Full read/write |
| `/portal/lp/[token]` | Investor portal | Read-only, filtered by `lp_visible` |

**Tokens:**
- Random 12-character alphanumeric strings
- Stored in `portal_links` table with `type`, `is_active`, optional `expires_at`
- Invalid or revoked tokens show a "This link is no longer active" page
- Multiple tokens can exist per type (e.g., different LP links for different investors)

---

## 3. Portal Layout

Both portals share a common shell: fixed sidebar on the left, scrollable content area on the right. Dark aesthetic matching the main site (`#0A0A0A` background, champagne `#C4B089` accents, Helvetica Neue typography).

### Team Portal Sidebar
1. Dashboard (overview with Gantt preview + recent milestones)
2. Gantt Chart (full interactive view)
3. Milestones (list view with status management)
4. Status Updates (chronological updates, markdown)
5. Documents (folder-based file management)
6. *(divider)*
7. LP Visibility (central control panel)

### LP Portal Sidebar
1. Overview (fund metrics + latest status update)
2. Milestones (LP-visible items only)
3. Documents (LP-visible folders only)

### Shared Layout Details
- Sidebar width: 200px, collapsible on mobile
- Sidebar brand: "Ownera Capital" logo + portal label (e.g., "Fund I — Deal Team")
- Active nav item: white text, left champagne border accent
- Content area: 24px padding, max content width within area

---

## 4. Data Model (Supabase)

### portal_links
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| token | text, unique, indexed | 12-char alphanumeric |
| type | text | 'team' or 'lp' |
| label | text | Human-readable label |
| is_active | boolean | Default true |
| created_at | timestamptz | |
| expires_at | timestamptz, nullable | Optional expiry |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| name | text | e.g., "Fund I" |
| description | text | |
| start_date | date | |
| target_end_date | date | |
| created_at | timestamptz | |

### gantt_tasks
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| project_id | uuid, FK → projects | |
| title | text | |
| start_date | date | |
| end_date | date | |
| progress | integer | 0-100 |
| parent_id | uuid, FK → self, nullable | For sub-tasks |
| sort_order | integer | |
| color | text, nullable | Optional override |
| lp_visible | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### milestones
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| project_id | uuid, FK → projects | |
| title | text | |
| description | text | |
| due_date | date | |
| status | text | 'pending', 'in_progress', 'completed', 'delayed' |
| sort_order | integer | |
| lp_visible | boolean | Default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### status_updates
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| project_id | uuid, FK → projects | |
| title | text | |
| body | text | Markdown content |
| lp_visible | boolean | Default false |
| created_at | timestamptz | |

### fund_metrics
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| project_id | uuid, FK → projects | |
| fund_size | numeric | |
| capital_deployed_pct | numeric | 0-100 |
| deal_count | integer | |
| vintage_year | integer | |
| updated_at | timestamptz | |

### document_folders
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| project_id | uuid, FK → projects | |
| name | text | e.g., "Quarterly Reports" |
| sort_order | integer | |
| lp_visible | boolean | Default false |
| created_at | timestamptz | |

### documents
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| folder_id | uuid, FK → document_folders | |
| name | text | |
| version | integer | Current version number |
| storage_path | text | Supabase Storage path |
| file_size | bigint | Bytes |
| mime_type | text | |
| uploaded_by | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### document_versions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| document_id | uuid, FK → documents | |
| version | integer | |
| storage_path | text | |
| file_size | bigint | |
| uploaded_by | text | |
| created_at | timestamptz | |

**Storage:** Single Supabase Storage bucket `portal-documents`, organized as `/{project_id}/{folder_id}/{filename}`.

**LP visibility pattern:** The `lp_visible` boolean on gantt_tasks, milestones, status_updates, and document_folders controls what surfaces on the LP portal. LP queries filter on `lp_visible = true`. Defaults to `false` — team must deliberately publish.

---

## 5. Team Portal — Feature Details

### 5.1 Dashboard
- Compact Gantt preview (read-only, top-level tasks only)
- Recent milestones (last 5, with status badges)
- Latest status update
- Quick action buttons: "+ Add Task", "+ Update"

### 5.2 Gantt Chart
**Display:**
- Horizontal timeline with monthly grid lines
- Parent tasks with collapsible sub-tasks
- Color-coded bars by phase (configurable per task, defaults: green/blue/amber/champagne)
- Progress percentage shown inside bars
- Milestone diamonds inline on the timeline (filled = completed, hollow = pending)
- Red "Today" vertical line
- Time scale toggle: Month / Quarter / Year

**Interaction (team only):**
- Drag entire bar to reschedule (updates start_date and end_date)
- Drag right handle to extend/shorten duration
- Click task name to edit inline
- Click bar to open detail panel: progress slider, date pickers, notes, status, LP visibility toggle
- "+ Add Task" button opens inline row or modal
- Drag to reorder tasks within same level
- Changes save automatically (debounced Supabase writes)

**LP Gantt view:** Not shown to LPs. LPs see milestones only, not the Gantt. This keeps internal pipeline detail private.

### 5.3 Milestones
**Team view:**
- List view with: colored status dot, title, status badge (pending/in-progress/completed/delayed), due date, LP visibility toggle
- Click to edit: title, description, due date, status
- Drag to reorder
- "+ Add Milestone" button

**LP view:**
- Same list layout but read-only
- Only shows items where `lp_visible = true`
- No visibility toggles or edit controls

### 5.4 Documents
**Team view:**
- Folders with LP visibility toggle per folder
- Files within folders: type icon (color-coded by extension), name, metadata (size, date, uploader)
- Version history: expandable panel showing all versions with dates, uploaders, and download links
- Actions per file: download, view history, replace with new version
- Drag-and-drop upload zone at bottom
- "+ New Folder" button
- Supported types: PDF, XLSX, PPTX, DOCX (up to 50 MB per file)

**LP view:**
- Only folders where `lp_visible = true`
- Files shown with download button only
- Version badge shows current version number
- No upload, no version history, no folder management

**Upload flow:**
1. User drops file or clicks upload zone
2. File uploads to Supabase Storage at `/{project_id}/{folder_id}/{filename}`
3. If file with same name exists in folder: current version copied to `document_versions`, then `documents` row updated with new version number, storage path, metadata
4. If new file: new row in `documents` with version 1

### 5.5 Status Updates
**Team view:**
- Chronological list of updates (newest first)
- Each update: title, markdown body, timestamp, LP visibility toggle
- "+ New Update" opens a markdown editor (simple textarea with preview)

**LP view:**
- Only updates where `lp_visible = true`
- Rendered markdown, read-only

### 5.6 LP Visibility Page
Central control panel for everything LPs can see. Four sections:

1. **Milestones** — Checklist of all milestones with toggles
2. **Gantt Tasks** — Checklist of parent tasks with toggles (sub-tasks inherit parent visibility)
3. **Document Folders** — Checklist of folders with toggles and file counts
4. **Status Updates** — Checklist of updates with toggles

Changes here update the same `lp_visible` fields as inline toggles elsewhere.

### 5.7 Fund Metrics
- Simple form on the LP Visibility page (or Dashboard)
- Fields: fund size, capital deployed %, deal count, vintage year
- Always visible on LP portal — no toggle
- Single row in `fund_metrics` table, updated in place

---

## 6. LP Portal — Feature Details

### 6.1 Overview Page
- Welcome text: "Welcome to the Ownera Capital Fund I investor portal."
- Fund metrics cards (2x2 grid): Fund Size, Capital Deployed %, Active Deals, Vintage Year
- Latest LP-visible status update (if any)
- Quarter badge in header (e.g., "Q2 2026")

### 6.2 Milestones Page
- Read-only list of LP-visible milestones
- Status dots, titles, status badges, due dates
- No edit controls

### 6.3 Documents Page
- LP-visible folders only
- Files with download buttons
- Version badge (latest version number)
- No upload, no version history access

---

## 7. Code Organization

```
app/
├── portal/
│   ├── layout.tsx              # Portal shell (validates token, renders sidebar)
│   ├── team/
│   │   └── [token]/
│   │       ├── page.tsx        # Team dashboard
│   │       ├── gantt/page.tsx
│   │       ├── milestones/page.tsx
│   │       ├── documents/page.tsx
│   │       ├── updates/page.tsx
│   │       └── visibility/page.tsx
│   ├── lp/
│   │   └── [token]/
│   │       ├── page.tsx        # LP overview
│   │       ├── milestones/page.tsx
│   │       └── documents/page.tsx
│   └── invalid/page.tsx        # Invalid/revoked token page

components/
├── portal/
│   ├── PortalSidebar.tsx       # Sidebar with nav items (adapts by portal type)
│   ├── PortalShell.tsx         # Shell layout (sidebar + content area)
│   ├── GanttChart.tsx          # Interactive Gantt (team) / read-only (LP)
│   ├── GanttBar.tsx            # Individual draggable bar
│   ├── GanttTaskRow.tsx        # Task row with label + track
│   ├── MilestoneList.tsx       # Milestone list component
│   ├── MilestoneRow.tsx        # Individual milestone row
│   ├── DocumentBrowser.tsx     # Folder/file browser
│   ├── DocumentFolder.tsx      # Single folder with files
│   ├── DocumentRow.tsx         # Single file row
│   ├── VersionHistory.tsx      # Expandable version panel
│   ├── FileUploadZone.tsx      # Drag-and-drop upload
│   ├── StatusUpdateList.tsx    # Status updates list
│   ├── StatusUpdateEditor.tsx  # Markdown editor for new updates
│   ├── FundMetricsGrid.tsx     # 2x2 metrics card grid
│   ├── FundMetricsForm.tsx     # Editable metrics form
│   ├── VisibilityToggle.tsx    # Champagne on/off toggle
│   ├── VisibilityPanel.tsx     # LP Visibility control page content
│   └── TokenInvalid.tsx        # Invalid token message

lib/
├── supabase/
│   ├── client.ts               # Supabase browser client
│   ├── server.ts               # Supabase server client (for SSR)
│   └── storage.ts              # Upload/download helpers
├── portal/
│   ├── types.ts                # Portal-specific TypeScript types
│   ├── queries.ts              # Supabase query functions
│   └── utils.ts                # Portal utilities (token validation, etc.)
```

---

## 8. Technical Details

### Supabase Client
- Install `@supabase/supabase-js`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Browser client for real-time and interactive operations
- Server client for SSR token validation and initial data fetch

### Token Validation Flow
1. Page loads with `[token]` param
2. Server-side: query `portal_links` for matching token where `is_active = true` and `expires_at` is null or in the future
3. If invalid: redirect to `/portal/invalid`
4. If valid: render portal with `type` determining team vs LP view

### Gantt Drag Interaction
- Use pointer events (not HTML5 drag-and-drop) for bar dragging
- On drag end: calculate new dates from pixel position relative to timeline grid
- Debounced Supabase update (300ms) to avoid excessive writes
- Optimistic UI: bar moves immediately, reverts on error

### File Upload
- Supabase Storage bucket: `portal-documents` (public bucket with token-based access, or RLS)
- Upload path: `/{project_id}/{folder_id}/{timestamp}-{filename}`
- Max file size: 50 MB
- Accepted types: application/pdf, xlsx, pptx, docx, and common spreadsheet/document MIME types

### Row-Level Security
- Since there's no user auth, RLS is based on the anon key
- Portal data is read/write for team tokens, read-only for LP tokens
- Token validation happens in the Next.js server layer (middleware or page-level), not at the Supabase RLS level
- The anon key has read/write access to portal tables; security is enforced by the application layer via token validation

### Responsive Behavior
- Sidebar collapses to hamburger menu below 768px
- Gantt chart: horizontal scroll on mobile, simplified bar labels
- Document grid: single column on mobile
- Metrics cards: stack to single column on mobile

---

## 9. Visual Design Tokens

Matches the existing site design system:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0A` | Portal background |
| Surface | `rgba(255,255,255,0.03)` | Cards, rows |
| Border | `rgba(255,255,255,0.06)` | Dividers, card borders |
| Border hover | `rgba(255,255,255,0.1)` | Hover states |
| Text primary | `#FFFFFF` | Headings |
| Text secondary | `#E5E5E5` | Body text |
| Text muted | `#86868B` | Captions, metadata |
| Accent | `#C4B089` | Toggles, badges, active states |
| Status green | `#10B981` | Completed |
| Status amber | `#F59E0B` | In progress |
| Status red | `#EF4444` | Delayed / today line |
| Status gray | `#4B5563` | Pending |
| Font | Helvetica Neue, -apple-system, sans-serif | All text |
| Transitions | 200ms ease | Interactive elements |
| Border radius | 10-12px | Cards, inputs |
| Border radius (badges) | 6-20px | Pills, toggles |

---

## 10. Out of Scope (for now)

- Real-time collaboration (multiple team members editing simultaneously)
- Notifications (email/webhook on document upload or milestone change)
- Audit log (who changed what, when)
- Multiple projects/funds (single fund assumed; data model supports it via `project_id` but UI is single-project)
- Deal-level cards on LP portal (architecture supports it, not building the UI yet)
- Admin page for generating/revoking links (manage directly in Supabase dashboard initially)

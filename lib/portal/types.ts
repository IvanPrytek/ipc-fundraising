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
  notes: string;
  assignee: string;
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

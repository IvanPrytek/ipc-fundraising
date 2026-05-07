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
  updates: Partial<Pick<GanttTask, "title" | "start_date" | "end_date" | "progress" | "sort_order" | "color" | "notes" | "lp_visible">>
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
  const { data: current } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (!current) return null;

  await supabase.from("document_versions").insert({
    document_id: documentId,
    version: current.version,
    storage_path: current.storage_path,
    file_size: current.file_size,
    uploaded_by: current.uploaded_by,
    created_at: current.updated_at,
  });

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

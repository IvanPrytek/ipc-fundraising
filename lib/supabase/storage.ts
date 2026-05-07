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

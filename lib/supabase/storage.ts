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

export async function getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

export async function deleteFile(storagePath: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);
  return !error;
}

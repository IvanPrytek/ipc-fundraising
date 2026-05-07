"use client";

import { useState } from "react";
import type { DocumentFolder, Document } from "@/lib/portal/types";
import { createDocumentFolder, createDocument, replaceDocumentVersion } from "@/lib/portal/queries";
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

export default function DocumentBrowser({ folders, projectId, editable, onFoldersChange }: DocumentBrowserProps) {
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const folder = await createDocumentFolder({ project_id: projectId, name: newFolderName.trim(), sort_order: folders.length });
    if (folder) onFoldersChange([...folders, { ...folder, documents: [] }]);
    setNewFolderName("");
    setAddingFolder(false);
  };

  const handleFolderUpdate = (updated: DocumentFolder) => {
    onFoldersChange(folders.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)));
  };

  const handleUploadToFirstFolder = async (files: File[]) => {
    if (folders.length === 0) return;
    const targetFolder = folders[0];
    setUploading(true);
    for (const file of files) {
      const { path, error } = await uploadFile(projectId, targetFolder.id, file);
      if (error || !path) continue;
      const doc = await createDocument({ folder_id: targetFolder.id, name: file.name, storage_path: path, file_size: file.size, mime_type: file.type || "application/octet-stream", uploaded_by: "Team" });
      if (doc) {
        onFoldersChange(folders.map((f) => f.id === targetFolder.id ? { ...f, documents: [...(f.documents ?? []), doc] } : f));
      }
    }
    setUploading(false);
  };

  const handleDocumentReplace = async (docId: string, file: File) => {
    const folder = folders.find((f) => f.documents?.some((d) => d.id === docId));
    if (!folder) return;
    setUploading(true);
    const { path, error } = await uploadFile(projectId, folder.id, file);
    if (error || !path) { setUploading(false); return; }
    const updated = await replaceDocumentVersion(docId, path, file.size, "Team");
    if (updated) {
      onFoldersChange(folders.map((f) => f.id === folder.id ? { ...f, documents: f.documents?.map((d) => d.id === docId ? updated : d) } : f));
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Documents</h2>
        {editable && <div className="flex gap-2"><PortalButton onClick={() => setAddingFolder(true)}>+ New Folder</PortalButton></div>}
      </div>
      {uploading && <div className="mb-4 rounded-lg bg-champagne/10 px-4 py-2 text-[13px] text-champagne">Uploading...</div>}
      {addingFolder && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
          <span className="text-lg">📁</span>
          <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." className="flex-1 rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none placeholder:text-[#4B5563]" onKeyDown={(e) => { if (e.key === "Enter") handleAddFolder(); if (e.key === "Escape") setAddingFolder(false); }} />
          <button onClick={handleAddFolder} className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]">Create</button>
          <button onClick={() => setAddingFolder(false)} className="text-[12px] text-[#86868B]">Cancel</button>
        </div>
      )}
      {folders.map((folder) => (<DocumentFolderComponent key={folder.id} folder={folder} documents={folder.documents ?? []} editable={editable} onFolderUpdate={handleFolderUpdate} onDocumentReplace={handleDocumentReplace} />))}
      {folders.length === 0 && <p className="py-8 text-center text-[13px] text-[#86868B]">No folders yet. Click "+ New Folder" to organize your documents.</p>}
      {editable && folders.length > 0 && <FileUploadZone onFilesSelected={handleUploadToFirstFolder} />}
    </div>
  );
}

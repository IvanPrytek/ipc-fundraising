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

export default function DocumentFolderComponent({ folder, documents, editable, onFolderUpdate, onDocumentReplace }: DocumentFolderProps) {
  const handleVisibilityToggle = async (visible: boolean) => {
    const updated = await updateDocumentFolder(folder.id, { lp_visible: visible });
    if (updated) onFolderUpdate(updated);
  };

  return (
    <div className="mb-7">
      <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📁</span>
          <span className="text-[15px] font-medium text-white">{folder.name}</span>
          <span className="rounded-[10px] bg-white/[0.06] px-2 py-0.5 text-[11px] text-[#86868B]">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
        </div>
        {editable && <VisibilityToggle isVisible={folder.lp_visible} onToggle={handleVisibilityToggle} label={folder.lp_visible ? "LP visible" : "Internal only"} />}
      </div>
      <div className="space-y-1.5">
        {documents.map((doc) => (<DocumentRow key={doc.id} document={doc} editable={editable} onReplace={(file) => onDocumentReplace(doc.id, file)} />))}
        {documents.length === 0 && <p className="py-3 text-center text-[12px] text-[#4B5563]">No files in this folder.</p>}
      </div>
    </div>
  );
}

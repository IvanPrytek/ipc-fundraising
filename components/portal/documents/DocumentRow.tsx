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

export default function DocumentRow({ document: doc, editable, onReplace }: DocumentRowProps) {
  const [showVersions, setShowVersions] = useState(false);
  const typeInfo = getFileTypeInfo(doc.mime_type);
  const url = getPublicUrl(doc.storage_path);

  return (
    <>
      <div className="flex items-center rounded-[10px] border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04]">
        <div className={cn("mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[14px]", typeInfo.colorClass)}>{typeInfo.label}</div>
        <div className="flex-1">
          <div className="text-[14px] text-[#e5e5e5]">{doc.name}</div>
          <div className="mt-0.5 flex gap-3 text-[11px] text-[#86868B]">
            <span>{formatFileSize(doc.file_size)}</span>
            <span>{formatDate(doc.updated_at)}</span>
            {doc.uploaded_by && <span>by {doc.uploaded_by}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-md px-2 py-0.5 text-[10px]", doc.version > 1 ? "bg-champagne/15 text-champagne" : "bg-white/[0.06] text-[#86868B]")}>v{doc.version}{doc.version > 1 ? " latest" : ""}</span>
          {doc.version > 1 && (
            <button onClick={() => setShowVersions(!showVersions)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]" title="Version history">↕</button>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]" title="Download">↓</a>
          {editable && onReplace && (
            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-sm text-[#86868B] hover:border-white/20 hover:text-[#e5e5e5]" title="Replace">
              ⟳
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(f); }} />
            </label>
          )}
        </div>
      </div>
      {showVersions && <VersionHistory documentId={doc.id} currentVersion={doc.version} />}
    </>
  );
}

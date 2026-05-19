"use client";

import { useEffect, useState } from "react";
import { getDocumentVersions } from "@/lib/portal/queries";
import { getSignedUrl } from "@/lib/supabase/storage";
import { formatDate } from "@/lib/portal/utils";
import type { DocumentVersion } from "@/lib/portal/types";

interface VersionHistoryProps {
  documentId: string;
  currentVersion: number;
}

function VersionRow({ v, currentVersion }: { v: DocumentVersion; currentVersion: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    getSignedUrl(v.storage_path).then(setUrl);
  }, [v.storage_path]);

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.03] py-1.5 last:border-b-0">
      <span className="w-7 text-[12px] text-[#86868B]">v{v.version}</span>
      <span className="text-[12px] text-[#86868B]">{formatDate(v.created_at)}</span>
      {v.uploaded_by && <span className="text-[12px] text-[#6B6560]">{v.uploaded_by}</span>}
      {v.version === currentVersion && <span className="text-[10px] text-emerald-400">Current</span>}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-[11px] text-champagne hover:underline">Download</a>
      ) : (
        <span className="ml-auto text-[11px] text-[#86868B]">Loading...</span>
      )}
    </div>
  );
}

export default function VersionHistory({ documentId, currentVersion }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  useEffect(() => {
    getDocumentVersions(documentId).then(setVersions);
  }, [documentId]);

  return (
    <div className="-mt-0.5 mb-1.5 rounded-b-[10px] border border-t-0 border-white/[0.04] bg-white/[0.015] px-4 py-3 pl-16">
      {versions.map((v) => (
        <VersionRow key={v.id} v={v} currentVersion={currentVersion} />
      ))}
      {versions.length === 0 && <p className="text-[12px] text-[#86868B]">No previous versions.</p>}
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { getDocumentFolders } from "@/lib/portal/queries";
import DocumentBrowser from "@/components/portal/documents/DocumentBrowser";
import type { DocumentFolder } from "@/lib/portal/types";

export default function TeamDocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDocumentFolders(projectId);
      setFolders(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <DocumentBrowser folders={folders} projectId={projectId} editable={true} onFoldersChange={setFolders} />;
}

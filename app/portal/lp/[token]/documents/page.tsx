"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getDocumentFolders } from "@/lib/portal/queries";
import DocumentBrowser from "@/components/portal/documents/DocumentBrowser";
import type { DocumentFolder } from "@/lib/portal/types";

export default function LPDocumentsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      const data = await getDocumentFolders(link.project_id, true);
      setFolders(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <DocumentBrowser folders={folders} projectId="" editable={false} onFoldersChange={setFolders} />;
}

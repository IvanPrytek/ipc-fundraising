"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getStatusUpdates } from "@/lib/portal/queries";
import StatusUpdateList from "@/components/portal/updates/StatusUpdateList";
import type { StatusUpdate } from "@/lib/portal/types";

export default function TeamUpdatesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getStatusUpdates(link.project_id);
      setUpdates(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <StatusUpdateList updates={updates} projectId={projectId!} editable={true} onUpdatesChange={setUpdates} />;
}

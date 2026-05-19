"use client";

import { use, useEffect, useState } from "react";
import { getStatusUpdates } from "@/lib/portal/queries";
import StatusUpdateList from "@/components/portal/updates/StatusUpdateList";
import type { StatusUpdate } from "@/lib/portal/types";

export default function TeamUpdatesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getStatusUpdates(projectId);
      setUpdates(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <StatusUpdateList updates={updates} projectId={projectId} editable={true} onUpdatesChange={setUpdates} />;
}

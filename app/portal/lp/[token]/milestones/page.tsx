"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getMilestones } from "@/lib/portal/queries";
import MilestoneList from "@/components/portal/milestones/MilestoneList";
import type { Milestone } from "@/lib/portal/types";

export default function LPMilestonesPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      const data = await getMilestones(link.project_id, true);
      setMilestones(data);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <MilestoneList milestones={milestones} projectId="" editable={false} onMilestonesChange={setMilestones} />;
}

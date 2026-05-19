"use client";

import { use, useEffect, useState } from "react";
import { getMilestones } from "@/lib/portal/queries";
import MilestoneList from "@/components/portal/milestones/MilestoneList";
import type { Milestone } from "@/lib/portal/types";

export default function LPMilestonesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMilestones(projectId, true);
      setMilestones(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return <MilestoneList milestones={milestones} projectId={projectId} editable={false} onMilestonesChange={setMilestones} />;
}

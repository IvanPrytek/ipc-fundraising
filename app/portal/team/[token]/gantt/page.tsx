"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getGanttTasks, getMilestones } from "@/lib/portal/queries";
import GanttChart from "@/components/portal/gantt/GanttChart";
import type { GanttTask, Milestone } from "@/lib/portal/types";

export default function GanttPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const [t, m] = await Promise.all([
        getGanttTasks(link.project_id),
        getMilestones(link.project_id),
      ]);
      setTasks(t);
      setMilestones(m);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[13px] text-[#86868B]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <GanttChart
        tasks={tasks}
        milestones={milestones}
        projectId={projectId!}
        onTasksChange={setTasks}
        onMilestonesChange={setMilestones}
      />
    </div>
  );
}

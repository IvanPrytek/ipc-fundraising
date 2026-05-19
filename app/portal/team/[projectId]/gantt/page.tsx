"use client";

import { use, useEffect, useState } from "react";
import { getGanttTasks, getMilestones } from "@/lib/portal/queries";
import GanttChart from "@/components/portal/gantt/GanttChart";
import type { GanttTask, Milestone } from "@/lib/portal/types";

export default function GanttPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, m] = await Promise.all([
        getGanttTasks(projectId),
        getMilestones(projectId),
      ]);
      setTasks(t);
      setMilestones(m);
      setLoading(false);
    }
    load();
  }, [projectId]);

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
        projectId={projectId}
        onTasksChange={setTasks}
        onMilestonesChange={setMilestones}
      />
    </div>
  );
}

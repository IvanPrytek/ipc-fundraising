"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getGanttTasks } from "@/lib/portal/queries";
import GanttChart from "@/components/portal/gantt/GanttChart";
import type { GanttTask } from "@/lib/portal/types";

export default function GanttPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);
      const data = await getGanttTasks(link.project_id);
      setTasks(data);
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
        projectId={projectId!}
        onTasksChange={setTasks}
      />
    </div>
  );
}

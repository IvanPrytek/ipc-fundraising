"use client";

import PortalButton from "@/components/portal/shared/PortalButton";
import { cn } from "@/lib/utils";

type TimeScale = "month" | "quarter" | "year";

interface GanttToolbarProps {
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
  onAddTask: () => void;
  onAddMilestone: () => void;
}

export default function GanttToolbar({
  timeScale,
  onTimeScaleChange,
  onAddTask,
  onAddMilestone,
}: GanttToolbarProps) {
  const scales: TimeScale[] = ["month", "quarter", "year"];

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#111] px-6 py-4">
      <h2 className="text-lg font-medium text-white">Gantt Chart</h2>
      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-white/15">
          {scales.map((s) => (
            <button
              key={s}
              onClick={() => onTimeScaleChange(s)}
              className={cn(
                "border-r border-white/10 px-3 py-1.5 text-[12px] capitalize last:border-r-0",
                timeScale === s
                  ? "bg-white/10 text-white"
                  : "text-[#e5e5e5] hover:bg-white/5"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <PortalButton onClick={onAddMilestone}>
          + Milestone
        </PortalButton>
        <PortalButton variant="accent" onClick={onAddTask}>
          + Add Task
        </PortalButton>
      </div>
    </div>
  );
}

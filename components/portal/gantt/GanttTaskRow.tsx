"use client";

import { cn } from "@/lib/utils";
import type { GanttTask } from "@/lib/portal/types";
import GanttBar from "./GanttBar";

interface GanttTaskRowProps {
  task: GanttTask;
  isParent: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  leftPercent: number;
  widthPercent: number;
  barColor: string;
  lpVisible: boolean;
  onBarDragEnd?: (newLeft: number, newWidth: number) => void;
  onBarClick?: () => void;
}

export default function GanttTaskRow({
  task,
  isParent,
  isExpanded,
  onToggleExpand,
  leftPercent,
  widthPercent,
  barColor,
  lpVisible,
  onBarDragEnd,
  onBarClick,
}: GanttTaskRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-[44px] items-center border-b border-white/[0.03] transition-colors",
        isParent && "bg-white/[0.02]",
        "hover:bg-white/[0.02]"
      )}
    >
      <div className="flex w-[220px] flex-shrink-0 items-center gap-2 px-4 py-2">
        {isParent ? (
          <button
            onClick={onToggleExpand}
            className="flex h-4 w-4 items-center justify-center text-[10px] text-[#86868B]"
          >
            {isExpanded ? "▼" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span
          className={cn(
            "text-[13px]",
            isParent ? "text-[#e5e5e5]" : "pl-3 text-[12px] text-[#9CA3AF]"
          )}
        >
          {task.title}
        </span>
        {lpVisible && (
          <span className="ml-1 rounded bg-champagne/15 px-1.5 py-0.5 text-[10px] text-champagne">
            LP
          </span>
        )}
      </div>

      <div className="relative h-[44px] flex-1">
        <GanttBar
          leftPercent={leftPercent}
          widthPercent={widthPercent}
          progress={task.progress}
          color={barColor}
          isSubTask={!isParent}
          onDragEnd={onBarDragEnd}
          onClick={onBarClick}
        />
      </div>
    </div>
  );
}

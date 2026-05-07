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
  onBarClick?: () => void;
  onBarDragEnd?: (newLeft: number, newWidth: number) => void;
  onToggleClosed?: () => void;
  onAddSubTask?: () => void;
  onDeleteTask?: () => void;
  isDragOver?: "above" | "below" | null;
  onRowDragStart?: () => void;
  onRowDragOver?: (position: "above" | "below") => void;
  onRowDragLeave?: () => void;
  onRowDrop?: () => void;
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
  onBarClick,
  onBarDragEnd,
  onToggleClosed,
  onAddSubTask,
  onDeleteTask,
  isDragOver,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
}: GanttTaskRowProps) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[44px] border-b border-white/[0.03] transition-colors",
        isParent && "bg-white/[0.02]",
        "hover:bg-white/[0.02]",
        isDragOver === "above" && "border-t-2 border-t-champagne",
        isDragOver === "below" && "border-b-2 border-b-champagne"
      )}
      onDragOver={(e) => {
        if (!onRowDragOver) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        onRowDragOver(e.clientY < midY ? "above" : "below");
      }}
      onDragLeave={onRowDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onRowDrop?.();
      }}
    >
      <div className="flex w-[220px] flex-shrink-0 items-start gap-1 px-4 py-2">
        {/* Drag handle */}
        {onRowDragStart ? (
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              onRowDragStart();
            }}
            className="mt-1 flex h-4 w-4 flex-shrink-0 cursor-grab items-center justify-center text-[10px] text-[#4B5563] opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
            title="Drag to reorder"
          >
            ⠿
          </div>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {isParent ? (
          <button
            onClick={onToggleExpand}
            className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center text-[10px] text-[#86868B]"
          >
            {isExpanded ? "▼" : "▸"}
          </button>
        ) : (
          <span className="mt-0.5 w-4 flex-shrink-0" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {onToggleClosed && (
              <button
                onClick={onToggleClosed}
                className={cn(
                  "mt-px flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border transition-colors",
                  task.closed
                    ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-400"
                    : "border-white/20 hover:border-white/40"
                )}
              >
                {task.closed && (
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
            <span
              onClick={onBarClick}
              className={cn(
                "cursor-pointer text-[13px] leading-tight hover:text-white",
                isParent ? "text-[#e5e5e5]" : "pl-3 text-[12px] text-[#9CA3AF]",
                task.closed && "text-[#4B5563] line-through"
              )}
            >
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {task.assignee && (
              <span className="w-fit rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#86868B]">
                {task.assignee}
              </span>
            )}
            {lpVisible && (
              <span className="w-fit rounded bg-champagne/15 px-1.5 py-0.5 text-[10px] text-champagne">
                LP
              </span>
            )}
          </div>
        </div>
        <div className="mt-0.5 flex flex-shrink-0 items-center gap-1">
          {onDeleteTask && (
            <button
              onClick={onDeleteTask}
              className="rounded px-1 py-0.5 text-[10px] text-[#86868B] opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              title="Delete"
            >
              ✕
            </button>
          )}
          {isParent && onAddSubTask && (
            <button
              onClick={onAddSubTask}
              className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[#86868B] opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
              title="Add sub-task"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-[44px] flex-1 self-stretch">
        <GanttBar
          leftPercent={leftPercent}
          widthPercent={widthPercent}
          color={barColor}
          isSubTask={!isParent}
          onClick={onBarClick}
          onDragEnd={onBarDragEnd}
        />
      </div>
    </div>
  );
}

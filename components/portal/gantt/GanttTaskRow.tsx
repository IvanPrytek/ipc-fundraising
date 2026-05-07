"use client";

import { useState } from "react";
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
  onAddSubTask?: () => void;
  onEditTask?: (title: string) => void;
  onDeleteTask?: () => void;
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
  onAddSubTask,
  onEditTask,
  onDeleteTask,
}: GanttTaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onEditTask?.(editTitle.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex min-h-[44px] border-b border-white/[0.03] transition-colors",
        isParent && "bg-white/[0.02]",
        "hover:bg-white/[0.02]"
      )}
    >
      <div className="flex w-[220px] flex-shrink-0 items-start gap-2 px-4 py-2">
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
          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setEditTitle(task.title);
                  setEditing(false);
                }
              }}
              onBlur={handleSave}
              className={cn(
                "rounded bg-white/5 px-1 text-[13px] leading-tight text-white outline-none focus:ring-1 focus:ring-champagne/50",
                !isParent && "pl-3 text-[12px]"
              )}
            />
          ) : (
            <span
              onClick={() => {
                setEditTitle(task.title);
                setEditing(true);
              }}
              className={cn(
                "cursor-pointer text-[13px] leading-tight hover:text-white",
                isParent ? "text-[#e5e5e5]" : "pl-3 text-[12px] text-[#9CA3AF]"
              )}
            >
              {task.title}
            </span>
          )}
          {lpVisible && (
            <span className="w-fit rounded bg-champagne/15 px-1.5 py-0.5 text-[10px] text-champagne">
              LP
            </span>
          )}
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

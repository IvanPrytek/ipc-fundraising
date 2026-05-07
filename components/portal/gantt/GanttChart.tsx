"use client";

import { useState, useMemo, useCallback } from "react";
import type { GanttTask } from "@/lib/portal/types";
import { dateToPercent, percentToDate } from "@/lib/portal/utils";
import { updateGanttTask, createGanttTask } from "@/lib/portal/queries";
import GanttToolbar from "./GanttToolbar";
import GanttTaskRow from "./GanttTaskRow";

type TimeScale = "month" | "quarter" | "year";

interface GanttChartProps {
  tasks: GanttTask[];
  projectId: string;
  onTasksChange: (tasks: GanttTask[]) => void;
}

function getTimeRange(tasks: GanttTask[], scale: TimeScale): { start: Date; end: Date; columns: { label: string; start: Date }[] } {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (scale === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31);
  } else if (scale === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3 - 3, 1);
    end = new Date(now.getFullYear(), q * 3 + 6, 0);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth() + 5, 0);
  }

  for (const t of tasks) {
    const ts = new Date(t.start_date);
    const te = new Date(t.end_date);
    if (ts < start) start = new Date(ts.getFullYear(), ts.getMonth(), 1);
    if (te > end) end = new Date(te.getFullYear(), te.getMonth() + 1, 0);
  }

  const columns: { label: string; start: Date }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const label = cursor.toLocaleDateString("en-US", {
      month: "short",
      year: scale === "year" ? undefined : "numeric",
    });
    columns.push({ label, start: new Date(cursor) });
    cursor.setMonth(cursor.getMonth() + (scale === "quarter" ? 3 : 1));
  }

  return { start, end, columns };
}

const DEFAULT_COLORS = ["green", "blue", "amber", "champagne"];

export default function GanttChart({
  tasks,
  projectId,
  onTasksChange,
}: GanttChartProps) {
  const [timeScale, setTimeScale] = useState<TimeScale>("month");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(tasks.filter((t) => !t.parent_id).map((t) => t.id)));
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const parentTasks = useMemo(() => tasks.filter((t) => !t.parent_id), [tasks]);
  const childMap = useMemo(() => {
    const map = new Map<string, GanttTask[]>();
    for (const t of tasks) {
      if (t.parent_id) {
        const children = map.get(t.parent_id) ?? [];
        children.push(t);
        map.set(t.parent_id, children);
      }
    }
    return map;
  }, [tasks]);

  const { start: rangeStart, end: rangeEnd, columns } = getTimeRange(tasks, timeScale);

  const handleDragEnd = useCallback(
    async (task: GanttTask, newLeft: number, newWidth: number) => {
      const newStart = percentToDate(newLeft, rangeStart, rangeEnd);
      const newEnd = percentToDate(newLeft + newWidth, rangeStart, rangeEnd);
      const startStr = newStart.toISOString().split("T")[0];
      const endStr = newEnd.toISOString().split("T")[0];

      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, start_date: startStr, end_date: endStr } : t
      );
      onTasksChange(updated);

      await updateGanttTask(task.id, { start_date: startStr, end_date: endStr });
    },
    [tasks, rangeStart, rangeEnd, onTasksChange]
  );

  const handleAddTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const task = await createGanttTask({
      project_id: projectId,
      title: newTaskTitle.trim(),
      start_date: now.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      sort_order: parentTasks.length,
      color: DEFAULT_COLORS[parentTasks.length % DEFAULT_COLORS.length],
    });

    if (task) {
      onTasksChange([...tasks, task]);
      setExpanded((prev) => new Set(prev).add(task.id));
    }
    setNewTaskTitle("");
    setAddingTask(false);
  }, [newTaskTitle, projectId, parentTasks.length, tasks, onTasksChange]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <GanttToolbar
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        onAddTask={() => setAddingTask(true)}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Column headers */}
          <div className="flex border-b border-white/[0.06] pb-2 pl-[220px] pt-3">
            {columns.map((col, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[11px] uppercase tracking-wider text-[#86868B]">
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* Task rows */}
          {parentTasks.map((task, idx) => {
            const color = task.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const left = dateToPercent(task.start_date, rangeStart, rangeEnd);
            const right = dateToPercent(task.end_date, rangeStart, rangeEnd);
            const width = Math.max(2, right - left);
            const isExp = expanded.has(task.id);
            const children = childMap.get(task.id) ?? [];

            return (
              <div key={task.id}>
                <GanttTaskRow
                  task={task}
                  isParent={true}
                  isExpanded={isExp}
                  onToggleExpand={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(task.id)) next.delete(task.id);
                      else next.add(task.id);
                      return next;
                    });
                  }}
                  leftPercent={left}
                  widthPercent={width}
                  barColor={color}
                  lpVisible={task.lp_visible}
                  onBarDragEnd={(l, w) => handleDragEnd(task, l, w)}
                />
                {isExp &&
                  children.map((child) => {
                    const cl = dateToPercent(child.start_date, rangeStart, rangeEnd);
                    const cr = dateToPercent(child.end_date, rangeStart, rangeEnd);
                    return (
                      <GanttTaskRow
                        key={child.id}
                        task={child}
                        isParent={false}
                        leftPercent={cl}
                        widthPercent={Math.max(2, cr - cl)}
                        barColor={color}
                        lpVisible={child.lp_visible}
                        onBarDragEnd={(l, w) => handleDragEnd(child, l, w)}
                      />
                    );
                  })}
              </div>
            );
          })}

          {/* Add task inline */}
          {addingTask && (
            <div className="flex items-center border-b border-white/[0.03] px-4 py-2">
              <div className="flex w-[220px] items-center gap-2">
                <span className="w-4" />
                <input
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                    if (e.key === "Escape") setAddingTask(false);
                  }}
                  placeholder="Task name..."
                  className="w-full rounded bg-transparent text-[13px] text-white outline-none placeholder:text-[#4B5563]"
                />
              </div>
              <div className="flex gap-2 pl-4">
                <button
                  onClick={handleAddTask}
                  className="rounded bg-champagne px-2 py-0.5 text-[11px] font-medium text-[#1A1A1A]"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingTask(false)}
                  className="text-[11px] text-[#86868B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 border-t border-white/[0.06] px-6 py-3">
        {DEFAULT_COLORS.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
            <div
              className={`h-3 w-3 rounded-sm ${
                c === "green" ? "bg-emerald-400" :
                c === "blue" ? "bg-blue-500" :
                c === "amber" ? "bg-amber-400" : "bg-champagne"
              }`}
            />
            <span className="capitalize">{c === "champagne" ? "Close" : c === "green" ? "Sourcing" : c === "blue" ? "DD" : "Structuring"}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <div className="h-3 w-3 rotate-45 rounded-sm border-2 border-champagne" />
          Milestone
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-red-400">
          │ Today
        </div>
      </div>
    </div>
  );
}

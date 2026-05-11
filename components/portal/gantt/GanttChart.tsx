"use client";

import { useState, useMemo, useCallback } from "react";
import type { GanttTask, Milestone } from "@/lib/portal/types";
import { dateToPercent, percentToDate } from "@/lib/portal/utils";
import {
  updateGanttTask,
  createGanttTask,
  deleteGanttTask,
  createMilestone,
  deleteMilestone,
} from "@/lib/portal/queries";
import GanttToolbar from "./GanttToolbar";
import GanttTaskRow from "./GanttTaskRow";
import GanttMilestone from "./GanttMilestone";
import GanttTaskPanel from "./GanttTaskPanel";

type TimeScale = "day" | "week";

interface GanttChartProps {
  tasks: GanttTask[];
  milestones: Milestone[];
  projectId: string;
  onTasksChange: (tasks: GanttTask[]) => void;
  onMilestonesChange: (milestones: Milestone[]) => void;
}

interface DayColumn {
  day: number;
  date: Date;
  isWeekend: boolean;
}

interface MonthGroup {
  label: string;
  days: DayColumn[];
}

interface WeekGroup {
  label: string;
  start: Date;
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function getTimeRange(
  tasks: GanttTask[],
  milestones: Milestone[],
  scale: TimeScale
): {
  start: Date;
  end: Date;
  columns: { label: string; start: Date }[];
  dayMonthGroups?: MonthGroup[];
} {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (scale === "week") {
    // Show ~12 weeks centered around today
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 70);
  } else {
    // Daily: 4 weeks centered around today
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21);
  }

  // Extend range to fit tasks and milestones
  for (const t of tasks) {
    const ts = new Date(t.start_date);
    const te = new Date(t.end_date);
    if (ts < start) start = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
    if (te > end) end = new Date(te.getFullYear(), te.getMonth(), te.getDate() + 1);
  }
  for (const m of milestones) {
    const md = new Date(m.due_date);
    if (md < start) start = new Date(md.getFullYear(), md.getMonth(), md.getDate());
    if (md > end) end = new Date(md.getFullYear(), md.getMonth(), md.getDate() + 1);
  }

  const columns: { label: string; start: Date }[] = [];
  const cursor = new Date(start);

  if (scale === "day") {
    // Daily view: weekdays only, grouped by month
    const dayMonthGroups: MonthGroup[] = [];
    let currentGroup: MonthGroup | null = null;

    while (cursor <= end) {
      if (!isWeekend(cursor)) {
        const monthLabel = cursor.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        const dayNum = cursor.getDate();

        if (!currentGroup || currentGroup.label !== monthLabel) {
          currentGroup = { label: monthLabel, days: [] };
          dayMonthGroups.push(currentGroup);
        }
        currentGroup.days.push({ day: dayNum, date: new Date(cursor), isWeekend: false });

        columns.push({
          label: `${dayNum}`,
          start: new Date(cursor),
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return { start, end, columns, dayMonthGroups };
  }

  // Weekly view: each column is a week (Mon start)
  // Align start to Monday
  while (cursor.getDay() !== 1) {
    cursor.setDate(cursor.getDate() - 1);
  }
  start = new Date(cursor);

  while (cursor <= end) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 4); // Friday
    const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    columns.push({ label, start: weekStart });
    cursor.setDate(cursor.getDate() + 7);
  }

  return { start, end, columns };
}

const DEFAULT_COLORS = ["green", "blue", "amber", "champagne"];

export default function GanttChart({
  tasks,
  milestones,
  projectId,
  onTasksChange,
  onMilestonesChange,
}: GanttChartProps) {
  const [timeScale, setTimeScale] = useState<TimeScale>("week");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(tasks.filter((t) => !t.parent_id).map((t) => t.id))
  );
  const [addingTask, setAddingTask] = useState(false);
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPos, setDragOverPos] = useState<"above" | "below" | null>(null);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  const parentTasks = useMemo(
    () => tasks.filter((t) => !t.parent_id),
    [tasks]
  );
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

  const {
    start: rangeStart,
    end: rangeEnd,
    columns,
    dayMonthGroups,
  } = getTimeRange(tasks, milestones, timeScale);

  const todayPercent = dateToPercent(
    new Date().toISOString().split("T")[0],
    rangeStart,
    rangeEnd
  );

  const totalDayCols = columns.length;

  // --- Handlers ---

  // Recalculate parent dates from children and persist
  const syncParentDates = useCallback(
    async (parentId: string, updatedTasks: GanttTask[]) => {
      const children = updatedTasks.filter((t) => t.parent_id === parentId);
      if (children.length === 0) return updatedTasks;

      const earliest = children.reduce(
        (min, c) => (c.start_date < min ? c.start_date : min),
        children[0].start_date
      );
      const latest = children.reduce(
        (max, c) => (c.end_date > max ? c.end_date : max),
        children[0].end_date
      );

      const result = updatedTasks.map((t) =>
        t.id === parentId
          ? { ...t, start_date: earliest, end_date: latest }
          : t
      );

      await updateGanttTask(parentId, {
        start_date: earliest,
        end_date: latest,
      });

      return result;
    },
    []
  );

  const handlePanelSave = useCallback(
    async (updates: {
      title: string;
      start_date: string;
      end_date: string;
      assignee: string;
      notes: string;
      display_notes: string;
    }) => {
      if (!selectedTaskId) return;
      const task = tasks.find((t) => t.id === selectedTaskId);

      let updated = tasks.map((t) =>
        t.id === selectedTaskId ? { ...t, ...updates } : t
      );

      await updateGanttTask(selectedTaskId, updates);

      // If this is a sub-task, sync the parent dates
      if (task?.parent_id) {
        updated = await syncParentDates(task.parent_id, updated);
      }

      onTasksChange(updated);
      setSelectedTaskId(null);
    },
    [selectedTaskId, tasks, onTasksChange, syncParentDates]
  );

  const handleDragEnd = useCallback(
    async (task: GanttTask, newLeft: number, newWidth: number) => {
      const newStart = percentToDate(newLeft, rangeStart, rangeEnd);
      const newEnd = percentToDate(newLeft + newWidth, rangeStart, rangeEnd);
      const startStr = newStart.toISOString().split("T")[0];
      const endStr = newEnd.toISOString().split("T")[0];

      let updated = tasks.map((t) =>
        t.id === task.id
          ? { ...t, start_date: startStr, end_date: endStr }
          : t
      );

      await updateGanttTask(task.id, {
        start_date: startStr,
        end_date: endStr,
      });

      // If this is a sub-task, sync the parent
      if (task.parent_id) {
        updated = await syncParentDates(task.parent_id, updated);
      }

      onTasksChange(updated);
    },
    [tasks, rangeStart, rangeEnd, onTasksChange, syncParentDates]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      onTasksChange(tasks.filter((t) => t.id !== taskId && t.parent_id !== taskId));
      await deleteGanttTask(taskId);
    },
    [tasks, onTasksChange]
  );

  const handleToggleClosed = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const closed = !task.closed;
      onTasksChange(tasks.map((t) => (t.id === taskId ? { ...t, closed } : t)));
      await updateGanttTask(taskId, { closed });
    },
    [tasks, onTasksChange]
  );

  const handleReorder = useCallback(
    async (sourceId: string, targetId: string, position: "above" | "below") => {
      const ordered = [...parentTasks];
      const srcIdx = ordered.findIndex((t) => t.id === sourceId);
      let tgtIdx = ordered.findIndex((t) => t.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return;

      const [moved] = ordered.splice(srcIdx, 1);
      // Recalculate target index after removal
      tgtIdx = ordered.findIndex((t) => t.id === targetId);
      const insertIdx = position === "below" ? tgtIdx + 1 : tgtIdx;
      ordered.splice(insertIdx, 0, moved);

      // Build new tasks array with updated sort_order
      const childTasks = tasks.filter((t) => t.parent_id);
      const reordered = ordered.map((t, i) => ({ ...t, sort_order: i }));
      onTasksChange([...reordered, ...childTasks]);

      // Persist sort_order for each moved task
      for (const t of reordered) {
        await updateGanttTask(t.id, { sort_order: t.sort_order });
      }
    },
    [parentTasks, tasks, onTasksChange]
  );

  const handleReorderSubTasks = useCallback(
    async (parentId: string, sourceId: string, targetId: string, position: "above" | "below") => {
      const children = childMap.get(parentId) ?? [];
      const ordered = [...children];
      const srcIdx = ordered.findIndex((t) => t.id === sourceId);
      let tgtIdx = ordered.findIndex((t) => t.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return;

      const [moved] = ordered.splice(srcIdx, 1);
      tgtIdx = ordered.findIndex((t) => t.id === targetId);
      const insertIdx = position === "below" ? tgtIdx + 1 : tgtIdx;
      ordered.splice(insertIdx, 0, moved);

      const reordered = ordered.map((t, i) => ({ ...t, sort_order: i }));
      const nonChildren = tasks.filter((t) => t.parent_id !== parentId);
      onTasksChange([...nonChildren, ...reordered]);

      for (const t of reordered) {
        await updateGanttTask(t.id, { sort_order: t.sort_order });
      }
    },
    [childMap, tasks, onTasksChange]
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

  const handleAddSubTask = useCallback(
    async (parentId: string) => {
      if (!newTaskTitle.trim()) return;
      const parent = tasks.find((t) => t.id === parentId);
      if (!parent) return;

      const children = childMap.get(parentId) ?? [];
      const task = await createGanttTask({
        project_id: projectId,
        title: newTaskTitle.trim(),
        start_date: parent.start_date,
        end_date: parent.end_date,
        parent_id: parentId,
        sort_order: children.length,
        color: parent.color,
      });

      if (task) {
        let updated = [...tasks, task];
        updated = await syncParentDates(parentId, updated);
        onTasksChange(updated);
        setExpanded((prev) => new Set(prev).add(parentId));
      }
      setNewTaskTitle("");
      setAddingSubTaskFor(null);
    },
    [newTaskTitle, projectId, tasks, childMap, onTasksChange, syncParentDates]
  );

  const handleAddMilestone = useCallback(async () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return;

    const m = await createMilestone({
      project_id: projectId,
      title: newMilestoneTitle.trim(),
      due_date: newMilestoneDate,
      sort_order: milestones.length,
    });

    if (m) {
      onMilestonesChange([...milestones, m]);
    }
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setAddingMilestone(false);
  }, [
    newMilestoneTitle,
    newMilestoneDate,
    projectId,
    milestones,
    onMilestonesChange,
  ]);

  const handleDeleteMilestone = useCallback(
    async (milestoneId: string) => {
      onMilestonesChange(milestones.filter((m) => m.id !== milestoneId));
      await deleteMilestone(milestoneId);
    },
    [milestones, onMilestonesChange]
  );

  const clearAdding = () => {
    setAddingTask(false);
    setAddingMilestone(false);
    setAddingSubTaskFor(null);
    setNewTaskTitle("");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <GanttToolbar
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        onAddTask={() => {
          clearAdding();
          setAddingTask(true);
        }}
        onAddMilestone={() => {
          clearAdding();
          setAddingMilestone(true);
        }}
      />

      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            minWidth:
              timeScale === "day"
                ? `${Math.max(800, 220 + totalDayCols * 36)}px`
                : "800px",
          }}
        >
          {/* Column headers */}
          {timeScale === "day" && dayMonthGroups ? (
            <div className="border-b border-white/[0.06] pl-[220px]">
              {/* Month row */}
              <div className="flex">
                {dayMonthGroups.map((group) => (
                  <div
                    key={group.label}
                    className="border-r border-white/[0.04] text-center"
                    style={{
                      width: `${(group.days.length / totalDayCols) * 100}%`,
                    }}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#86868B]">
                      {group.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Day numbers + weekday row */}
              <div className="flex pb-1.5">
                {dayMonthGroups.flatMap((group) =>
                  group.days.map((d) => {
                    const isToday =
                      d.date.toDateString() === new Date().toDateString();
                    const dayName = d.date.toLocaleDateString("en-US", { weekday: "narrow" });
                    return (
                      <div
                        key={d.date.toISOString()}
                        className="flex flex-1 flex-col items-center"
                      >
                        <span
                          className={`text-[8px] ${isToday ? "text-red-400" : "text-[#4B5563]"}`}
                        >
                          {dayName}
                        </span>
                        <span
                          className={`text-[10px] ${isToday ? "font-bold text-red-400" : "text-[#86868B]"}`}
                        >
                          {d.day}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex border-b border-white/[0.06] pb-2 pl-[220px] pt-3">
              {columns.map((col, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-[#86868B]">
                    {col.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Task rows */}
          {parentTasks.map((task, idx) => {
            const color =
              task.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const children = childMap.get(task.id) ?? [];

            // If parent has children, span from earliest start to latest end
            let effectiveStart = task.start_date;
            let effectiveEnd = task.end_date;
            if (children.length > 0) {
              effectiveStart = children.reduce(
                (min, c) => (c.start_date < min ? c.start_date : min),
                children[0].start_date
              );
              effectiveEnd = children.reduce(
                (max, c) => (c.end_date > max ? c.end_date : max),
                children[0].end_date
              );
            }

            const left = dateToPercent(effectiveStart, rangeStart, rangeEnd);
            const right = dateToPercent(effectiveEnd, rangeStart, rangeEnd);
            const width = Math.max(2, right - left);
            const isExp = expanded.has(task.id);

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
                  onBarClick={() => setSelectedTaskId(task.id)}
                  onBarDragEnd={(l, w) => handleDragEnd(task, l, w)}
                  onAddSubTask={() => {
                    clearAdding();
                    setAddingSubTaskFor(task.id);
                    setExpanded((prev) => new Set(prev).add(task.id));
                  }}
                  onToggleClosed={() => handleToggleClosed(task.id)}
                  onDeleteTask={() => handleDeleteTask(task.id)}
                  isDragOver={dragOverId === task.id ? dragOverPos : null}
                  onRowDragStart={() => setDragSourceId(task.id)}
                  onRowDragOver={(pos) => {
                    if (dragSourceId && dragSourceId !== task.id) {
                      setDragOverId(task.id);
                      setDragOverPos(pos);
                    }
                  }}
                  onRowDragLeave={() => {
                    if (dragOverId === task.id) {
                      setDragOverId(null);
                      setDragOverPos(null);
                    }
                  }}
                  onRowDrop={() => {
                    if (dragSourceId && dragOverId && dragOverPos) {
                      handleReorder(dragSourceId, dragOverId, dragOverPos);
                    }
                    setDragSourceId(null);
                    setDragOverId(null);
                    setDragOverPos(null);
                  }}
                />
                {isExp &&
                  children.map((child) => {
                    const cl = dateToPercent(
                      child.start_date,
                      rangeStart,
                      rangeEnd
                    );
                    const cr = dateToPercent(
                      child.end_date,
                      rangeStart,
                      rangeEnd
                    );
                    return (
                      <GanttTaskRow
                        key={child.id}
                        task={child}
                        isParent={false}
                        leftPercent={cl}
                        widthPercent={Math.max(2, cr - cl)}
                        barColor={color}
                        lpVisible={child.lp_visible}
                        onBarClick={() => setSelectedTaskId(child.id)}
                        onBarDragEnd={(l, w) => handleDragEnd(child, l, w)}
                        onToggleClosed={() => handleToggleClosed(child.id)}
                        onDeleteTask={() => handleDeleteTask(child.id)}
                        isDragOver={dragOverId === child.id ? dragOverPos : null}
                        onRowDragStart={() => setDragSourceId(child.id)}
                        onRowDragOver={(pos) => {
                          if (dragSourceId && dragSourceId !== child.id) {
                            setDragOverId(child.id);
                            setDragOverPos(pos);
                          }
                        }}
                        onRowDragLeave={() => {
                          if (dragOverId === child.id) {
                            setDragOverId(null);
                            setDragOverPos(null);
                          }
                        }}
                        onRowDrop={() => {
                          if (dragSourceId && dragOverId && dragOverPos) {
                            handleReorderSubTasks(task.id, dragSourceId, dragOverId, dragOverPos);
                          }
                          setDragSourceId(null);
                          setDragOverId(null);
                          setDragOverPos(null);
                        }}
                      />
                    );
                  })}

                {/* Inline sub-task add */}
                {addingSubTaskFor === task.id && (
                  <div className="flex items-center border-b border-white/[0.03] bg-white/[0.01] px-4 py-2">
                    <div className="flex w-[220px] items-center gap-2">
                      <span className="w-4" />
                      <span className="pl-3 text-[10px] text-[#86868B]">
                        ↳
                      </span>
                      <input
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSubTask(task.id);
                          if (e.key === "Escape") clearAdding();
                        }}
                        placeholder="Sub-task name..."
                        className="w-full rounded bg-transparent text-[12px] text-white outline-none placeholder:text-[#4B5563]"
                      />
                    </div>
                    <div className="flex gap-2 pl-4">
                      <button
                        onClick={() => handleAddSubTask(task.id)}
                        className="rounded bg-champagne px-2 py-0.5 text-[11px] font-medium text-[#1A1A1A]"
                      >
                        Add
                      </button>
                      <button
                        onClick={clearAdding}
                        className="text-[11px] text-[#86868B]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Milestone rows */}
          {milestones.length > 0 && (
            <>
              <div className="border-b border-white/[0.03] px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
                  Milestones
                </span>
              </div>
              {milestones.map((m) => {
                const pos = dateToPercent(m.due_date, rangeStart, rangeEnd);
                return (
                  <div
                    key={m.id}
                    className="group flex min-h-[44px] items-center border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <div className="flex w-[220px] flex-shrink-0 items-center gap-2 px-4 py-2">
                      <span className="w-4 text-center text-[10px] text-champagne">
                        ◇
                      </span>
                      <span className="flex-1 text-[13px] text-[#e5e5e5]">
                        {m.title}
                      </span>
                      <button
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="rounded px-1 py-0.5 text-[10px] text-[#86868B] opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                        title="Delete milestone"
                      >
                        ✕
                      </button>
                      <span className="text-[10px] text-[#86868B]">
                        {new Date(m.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="relative h-[44px] flex-1">
                      <GanttMilestone
                        leftPercent={pos}
                        completed={m.status === "completed"}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}

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
                    if (e.key === "Escape") clearAdding();
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
                  onClick={clearAdding}
                  className="text-[11px] text-[#86868B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add milestone inline */}
          {addingMilestone && (
            <div className="flex items-center border-b border-white/[0.03] px-4 py-2">
              <div className="flex w-[220px] items-center gap-2">
                <span className="w-4 text-center text-[10px] text-champagne">
                  ◇
                </span>
                <input
                  autoFocus
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMilestone();
                    if (e.key === "Escape") clearAdding();
                  }}
                  placeholder="Milestone name..."
                  className="w-full rounded bg-transparent text-[13px] text-white outline-none placeholder:text-[#4B5563]"
                />
              </div>
              <div className="flex items-center gap-2 pl-4">
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="rounded bg-white/5 px-2 py-0.5 text-[12px] text-white outline-none"
                />
                <button
                  onClick={handleAddMilestone}
                  className="rounded bg-champagne px-2 py-0.5 text-[11px] font-medium text-[#1A1A1A]"
                >
                  Add
                </button>
                <button
                  onClick={clearAdding}
                  className="text-[11px] text-[#86868B]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Milestone vertical lines */}
          {milestones.map((m) => {
            const pos = dateToPercent(m.due_date, rangeStart, rangeEnd);
            if (pos <= 0 || pos >= 100) return null;
            return (
              <div
                key={`line-${m.id}`}
                className="pointer-events-none absolute top-0 bottom-0 z-[5]"
                style={{
                  left: `calc(220px + (100% - 220px) * ${pos / 100})`,
                  width: "1px",
                  backgroundImage: "repeating-linear-gradient(to bottom, #C4B08966 0px, #C4B08966 4px, transparent 4px, transparent 8px)",
                }}
              />
            );
          })}

          {/* Today line */}
          {todayPercent > 0 && todayPercent < 100 && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-[6]"
              style={{
                left: `calc(220px + (100% - 220px) * ${todayPercent / 100})`,
                width: "1px",
                background: "rgba(239, 68, 68, 0.4)",
              }}
            >
              <div className="absolute -top-0 -left-3.5 text-[8px] text-red-400/70">
                Today
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 border-t border-white/[0.06] px-6 py-3">
        {DEFAULT_COLORS.map((c) => (
          <div
            key={c}
            className="flex items-center gap-1.5 text-[11px] text-[#86868B]"
          >
            <div
              className={`h-3 w-3 rounded-sm ${
                c === "green"
                  ? "bg-emerald-400"
                  : c === "blue"
                    ? "bg-blue-500"
                    : c === "amber"
                      ? "bg-amber-400"
                      : "bg-champagne"
              }`}
            />
            <span className="capitalize">
              {c === "champagne"
                ? "Close"
                : c === "green"
                  ? "Sourcing"
                  : c === "blue"
                    ? "DD"
                    : "Structuring"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <div className="h-3 w-3 rotate-45 rounded-sm border border-champagne/60" />
          Milestone
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <div className="h-3 w-px bg-red-400/40" />
          Today
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
          <div className="h-3 w-px" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #C4B08966 0px, #C4B08966 2px, transparent 2px, transparent 4px)" }} />
          Milestone date
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <GanttTaskPanel
          task={selectedTask}
          hasChildren={(childMap.get(selectedTask.id) ?? []).length > 0}
          onSave={handlePanelSave}
          onDelete={() => {
            handleDeleteTask(selectedTask.id);
            setSelectedTaskId(null);
          }}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}

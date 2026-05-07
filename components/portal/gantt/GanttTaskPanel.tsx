"use client";

import { useState } from "react";
import type { GanttTask } from "@/lib/portal/types";

interface GanttTaskPanelProps {
  task: GanttTask;
  onSave: (updates: {
    title: string;
    start_date: string;
    end_date: string;
    notes: string;
  }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function GanttTaskPanel({
  task,
  onSave,
  onDelete,
  onClose,
}: GanttTaskPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [startDate, setStartDate] = useState(task.start_date);
  const [endDate, setEndDate] = useState(task.end_date);
  const [notes, setNotes] = useState(task.notes ?? "");

  const handleSave = () => {
    onSave({
      title: title.trim() || task.title,
      start_date: startDate,
      end_date: endDate,
      notes,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[400px] max-w-[90vw] flex-col border-l border-white/[0.08] bg-[#111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className="text-[15px] font-medium text-white">Task Details</h3>
          <button
            onClick={onClose}
            className="text-[#86868B] hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-[#86868B]">
                Task Name
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-[#86868B]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-[#86868B]">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50"
                />
              </div>
            </div>

            {/* Duration display */}
            {startDate && endDate && (
              <div className="text-[12px] text-[#86868B]">
                Duration:{" "}
                {Math.max(
                  1,
                  Math.ceil(
                    (new Date(endDate).getTime() -
                      new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}{" "}
                days
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-[#86868B]">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, comments, or context..."
                rows={6}
                className="w-full resize-y rounded-lg bg-white/5 px-3 py-2.5 text-[14px] leading-relaxed text-white outline-none placeholder:text-[#4B5563] focus:ring-1 focus:ring-champagne/50"
              />
            </div>

            {/* Info */}
            <div className="rounded-lg bg-white/[0.03] px-4 py-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#86868B]">Created</span>
                <span className="text-[#e5e5e5]">
                  {new Date(task.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {task.parent_id && (
                <div className="mt-1.5 flex justify-between text-[12px]">
                  <span className="text-[#86868B]">Type</span>
                  <span className="text-[#9CA3AF]">Sub-task</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <button
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-[12px] text-[#86868B] transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Delete Task
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/15 px-4 py-2 text-[12px] text-[#e5e5e5] hover:border-white/30"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-champagne px-4 py-2 text-[12px] font-medium text-[#1A1A1A] hover:bg-champagne-light"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

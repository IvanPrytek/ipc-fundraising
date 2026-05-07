"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Milestone, MilestoneStatus } from "@/lib/portal/types";
import { formatShortDate } from "@/lib/portal/utils";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import { updateMilestone } from "@/lib/portal/queries";

interface MilestoneRowProps {
  milestone: Milestone;
  editable: boolean;
  onUpdate: (updated: Milestone) => void;
}

const STATUSES: MilestoneStatus[] = ["pending", "in_progress", "completed", "delayed"];

export default function MilestoneRow({ milestone, editable, onUpdate }: MilestoneRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(milestone.title);
  const [status, setStatus] = useState(milestone.status);
  const [dueDate, setDueDate] = useState(milestone.due_date);

  const handleSave = async () => {
    const updated = await updateMilestone(milestone.id, { title, status, due_date: dueDate });
    if (updated) onUpdate(updated);
    setEditing(false);
  };

  const handleVisibilityToggle = async (visible: boolean) => {
    const updated = await updateMilestone(milestone.id, { lp_visible: visible });
    if (updated) onUpdate(updated);
  };

  const handleStatusCycle = async () => {
    if (!editable) return;
    const idx = STATUSES.indexOf(milestone.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    const updated = await updateMilestone(milestone.id, { status: next });
    if (updated) {
      setStatus(next);
      onUpdate(updated);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50" />
        <div className="flex gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value as MilestoneStatus)} className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none">
            {STATUSES.map((s) => (<option key={s} value={s}>{s.replace("_", " ")}</option>))}
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]">Save</button>
          <button onClick={() => setEditing(false)} className="text-[12px] text-[#86868B]">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3 transition-colors hover:border-white/[0.08]">
      <StatusDot status={milestone.status} />
      <span className={cn("flex-1 text-[13px] text-[#e5e5e5]", editable && "cursor-pointer hover:text-white")} onClick={() => editable && setEditing(true)}>
        {milestone.title}
      </span>
      {editable && <VisibilityToggle isVisible={milestone.lp_visible} onToggle={handleVisibilityToggle} />}
      <button onClick={handleStatusCycle}><StatusBadge status={milestone.status} /></button>
      <span className="text-[11px] text-[#86868B]">{formatShortDate(milestone.due_date)}</span>
    </div>
  );
}

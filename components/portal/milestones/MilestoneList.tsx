"use client";

import { useState } from "react";
import type { Milestone } from "@/lib/portal/types";
import { createMilestone } from "@/lib/portal/queries";
import MilestoneRow from "./MilestoneRow";
import PortalButton from "@/components/portal/shared/PortalButton";

interface MilestoneListProps {
  milestones: Milestone[];
  projectId: string;
  editable: boolean;
  onMilestonesChange: (milestones: Milestone[]) => void;
}

export default function MilestoneList({ milestones, projectId, editable, onMilestonesChange }: MilestoneListProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return;
    const m = await createMilestone({ project_id: projectId, title: newTitle.trim(), due_date: newDate, sort_order: milestones.length });
    if (m) onMilestonesChange([...milestones, m]);
    setNewTitle("");
    setNewDate("");
    setAdding(false);
  };

  const handleUpdate = (updated: Milestone) => {
    onMilestonesChange(milestones.map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Milestones</h2>
        {editable && <PortalButton variant="accent" onClick={() => setAdding(true)}>+ Add Milestone</PortalButton>}
      </div>
      <div className="space-y-1.5">
        {milestones.map((m) => (<MilestoneRow key={m.id} milestone={m} editable={editable} onUpdate={handleUpdate} />))}
        {milestones.length === 0 && !adding && <p className="py-8 text-center text-[13px] text-[#86868B]">No milestones yet. Click "+ Add Milestone" to get started.</p>}
        {adding && (
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
            <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Milestone title..." className="flex-1 rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#4B5563]" onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }} />
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded bg-white/5 px-3 py-2 text-[13px] text-white outline-none" />
            <button onClick={handleAdd} className="rounded bg-champagne px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A]">Add</button>
            <button onClick={() => setAdding(false)} className="text-[12px] text-[#86868B]">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

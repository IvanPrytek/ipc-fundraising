"use client";

import { useState } from "react";
import type { StatusUpdate } from "@/lib/portal/types";
import { createStatusUpdate, updateStatusUpdate, deleteStatusUpdate } from "@/lib/portal/queries";
import { formatDate } from "@/lib/portal/utils";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import StatusUpdateEditor from "./StatusUpdateEditor";
import PortalButton from "@/components/portal/shared/PortalButton";

interface StatusUpdateListProps {
  updates: StatusUpdate[];
  projectId: string;
  editable: boolean;
  onUpdatesChange: (updates: StatusUpdate[]) => void;
}

export default function StatusUpdateList({ updates, projectId, editable, onUpdatesChange }: StatusUpdateListProps) {
  const [adding, setAdding] = useState(false);

  const handleSave = async (title: string, body: string) => {
    const update = await createStatusUpdate({ project_id: projectId, title, body });
    if (update) onUpdatesChange([update, ...updates]);
    setAdding(false);
  };

  const handleVisibilityToggle = async (updateId: string, visible: boolean) => {
    const updated = await updateStatusUpdate(updateId, { lp_visible: visible });
    if (updated) onUpdatesChange(updates.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDelete = async (updateId: string) => {
    const ok = await deleteStatusUpdate(updateId);
    if (ok) onUpdatesChange(updates.filter((u) => u.id !== updateId));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Status Updates</h2>
        {editable && !adding && <PortalButton variant="accent" onClick={() => setAdding(true)}>+ New Update</PortalButton>}
      </div>
      {adding && <div className="mb-6"><StatusUpdateEditor onSave={handleSave} onCancel={() => setAdding(false)} /></div>}
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-white">{update.title}</h3>
              <div className="flex items-center gap-3">
                {editable && (
                  <>
                    <VisibilityToggle isVisible={update.lp_visible} onToggle={(v) => handleVisibilityToggle(update.id, v)} label="LP" />
                    <button onClick={() => handleDelete(update.id)} className="text-[11px] text-[#86868B] hover:text-red-400">Delete</button>
                  </>
                )}
                <span className="text-[11px] text-[#86868B]">{formatDate(update.created_at)}</span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-[#86868B] whitespace-pre-wrap">{update.body}</p>
          </div>
        ))}
        {updates.length === 0 && !adding && <p className="py-8 text-center text-[13px] text-[#86868B]">No updates yet. Click "+ New Update" to publish your first update.</p>}
      </div>
    </div>
  );
}

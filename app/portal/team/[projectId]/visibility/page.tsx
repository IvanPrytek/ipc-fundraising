"use client";

import { use, useEffect, useState } from "react";
import {
  getMilestones, getGanttTasks, getDocumentFolders,
  getStatusUpdates, getFundMetrics, updateMilestone, updateGanttTask,
  updateDocumentFolder, updateStatusUpdate,
} from "@/lib/portal/queries";
import VisibilityToggle from "@/components/portal/shared/VisibilityToggle";
import FundMetricsForm from "@/components/portal/metrics/FundMetricsForm";
import type { Milestone, GanttTask, DocumentFolder, StatusUpdate, FundMetrics } from "@/lib/portal/types";

export default function VisibilityPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [m, t, f, u, met] = await Promise.all([
        getMilestones(projectId),
        getGanttTasks(projectId),
        getDocumentFolders(projectId),
        getStatusUpdates(projectId),
        getFundMetrics(projectId),
      ]);
      setMilestones(m);
      setTasks(t.filter((task) => !task.parent_id));
      setFolders(f);
      setUpdates(u);
      setMetrics(met);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  const toggleMilestone = async (id: string, visible: boolean) => {
    const updated = await updateMilestone(id, { lp_visible: visible });
    if (updated) setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };
  const toggleTask = async (id: string, visible: boolean) => {
    const updated = await updateGanttTask(id, { lp_visible: visible });
    if (updated) setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };
  const toggleFolder = async (id: string, visible: boolean) => {
    const updated = await updateDocumentFolder(id, { lp_visible: visible });
    if (updated) setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };
  const toggleUpdate = async (id: string, visible: boolean) => {
    const updated = await updateStatusUpdate(id, { lp_visible: visible });
    if (updated) setUpdates((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-white">LP Visibility</h2>
        <p className="mt-1 text-[13px] text-[#86868B]">Control what investors see on their portal.</p>
      </div>

      {metrics && <FundMetricsForm metrics={metrics} onUpdate={setMetrics} />}

      <Section title="Milestones" count={milestones.filter((m) => m.lp_visible).length} total={milestones.length}>
        {milestones.map((m) => (<ToggleRow key={m.id} label={m.title} isVisible={m.lp_visible} onToggle={(v) => toggleMilestone(m.id, v)} />))}
      </Section>

      <Section title="Gantt Tasks" count={tasks.filter((t) => t.lp_visible).length} total={tasks.length}>
        {tasks.map((t) => (<ToggleRow key={t.id} label={t.title} isVisible={t.lp_visible} onToggle={(v) => toggleTask(t.id, v)} />))}
      </Section>

      <Section title="Document Folders" count={folders.filter((f) => f.lp_visible).length} total={folders.length}>
        {folders.map((f) => (<ToggleRow key={f.id} label={`${f.name} (${f.documents?.length ?? 0} files)`} isVisible={f.lp_visible} onToggle={(v) => toggleFolder(f.id, v)} />))}
      </Section>

      <Section title="Status Updates" count={updates.filter((u) => u.lp_visible).length} total={updates.length}>
        {updates.map((u) => (<ToggleRow key={u.id} label={u.title} isVisible={u.lp_visible} onToggle={(v) => toggleUpdate(u.id, v)} />))}
      </Section>
    </div>
  );
}

function Section({ title, count, total, children }: { title: string; count: number; total: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-[2px] text-champagne">{title}</h3>
        <span className="text-[11px] text-[#86868B]">{count}/{total} visible</span>
      </div>
      <div className="space-y-1">{children}</div>
      {total === 0 && <p className="py-3 text-[12px] text-[#4B5563]">None created yet.</p>}
    </div>
  );
}

function ToggleRow({ label, isVisible, onToggle }: { label: string; isVisible: boolean; onToggle: (visible: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] px-4 py-2.5">
      <span className="text-[13px] text-[#e5e5e5]">{label}</span>
      <VisibilityToggle isVisible={isVisible} onToggle={onToggle} />
    </div>
  );
}

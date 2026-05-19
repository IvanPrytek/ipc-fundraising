"use client";

import { use, useEffect, useState } from "react";
import { getMilestones, getStatusUpdates, getFundMetrics } from "@/lib/portal/queries";
import { getQuarterLabel, formatShortDate } from "@/lib/portal/utils";
import FundMetricsGrid from "@/components/portal/metrics/FundMetricsGrid";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import type { Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

export default function LPOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [met, mil, upd] = await Promise.all([
        getFundMetrics(projectId),
        getMilestones(projectId, true),
        getStatusUpdates(projectId, true),
      ]);
      setMetrics(met);
      setMilestones(mil.slice(0, 5));
      setUpdates(upd.slice(0, 1));
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-[13px] text-[#86868B]">Loading...</div></div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-medium text-white">Fund Overview</h1>
        <span className="rounded-full bg-champagne/15 px-3 py-1 text-[11px] text-champagne">{getQuarterLabel()}</span>
      </div>
      <p className="mb-8 text-[15px] leading-relaxed text-[#86868B]">Welcome to the Ownera Capital investor portal. Below is the current fund status and key milestones.</p>
      {metrics && <div className="mb-8"><FundMetricsGrid metrics={metrics} /></div>}
      {milestones.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">Key Milestones</div>
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3">
                <StatusDot status={m.status} />
                <span className="flex-1 text-[13px] text-[#e5e5e5]">{m.title}</span>
                <StatusBadge status={m.status} />
                <span className="text-[11px] text-[#86868B]">{formatShortDate(m.due_date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {updates.length > 0 && (
        <section>
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">Latest Update</div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-1 text-[15px] font-medium text-white">{updates[0].title}</h3>
            <p className="text-[13px] leading-relaxed text-[#86868B] whitespace-pre-wrap">{updates[0].body}</p>
          </div>
        </section>
      )}
    </div>
  );
}

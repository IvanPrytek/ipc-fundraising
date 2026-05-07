"use client";

import { useState } from "react";
import type { FundMetrics } from "@/lib/portal/types";
import { updateFundMetrics } from "@/lib/portal/queries";
import PortalButton from "@/components/portal/shared/PortalButton";

interface FundMetricsFormProps {
  metrics: FundMetrics;
  onUpdate: (metrics: FundMetrics) => void;
}

export default function FundMetricsForm({ metrics, onUpdate }: FundMetricsFormProps) {
  const [fundSize, setFundSize] = useState(String(metrics.fund_size));
  const [deployed, setDeployed] = useState(String(metrics.capital_deployed_pct));
  const [dealCount, setDealCount] = useState(String(metrics.deal_count));
  const [vintage, setVintage] = useState(String(metrics.vintage_year));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateFundMetrics(metrics.project_id, {
      fund_size: Number(fundSize),
      capital_deployed_pct: Number(deployed),
      deal_count: Number(dealCount),
      vintage_year: Number(vintage),
    });
    if (updated) onUpdate(updated);
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[2px] text-champagne">Fund Metrics (shown to LPs)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">Fund Size ($)</label>
          <input type="number" value={fundSize} onChange={(e) => setFundSize(e.target.value)} className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">Capital Deployed (%)</label>
          <input type="number" min="0" max="100" value={deployed} onChange={(e) => setDeployed(e.target.value)} className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">Deal Count</label>
          <input type="number" value={dealCount} onChange={(e) => setDealCount(e.target.value)} className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#86868B]">Vintage Year</label>
          <input type="number" value={vintage} onChange={(e) => setVintage(e.target.value)} className="w-full rounded bg-white/5 px-3 py-2 text-[14px] text-white outline-none focus:ring-1 focus:ring-champagne/50" />
        </div>
      </div>
      <div className="mt-4">
        <PortalButton variant="accent" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Metrics"}</PortalButton>
      </div>
    </div>
  );
}

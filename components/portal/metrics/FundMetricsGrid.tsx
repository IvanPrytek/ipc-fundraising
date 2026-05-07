import type { FundMetrics } from "@/lib/portal/types";

interface FundMetricsGridProps {
  metrics: FundMetrics;
}

export default function FundMetricsGrid({ metrics }: FundMetricsGridProps) {
  const items = [
    { value: `$${(metrics.fund_size / 1_000_000).toFixed(0)}M`, label: "Fund Size" },
    { value: `${metrics.capital_deployed_pct}%`, label: "Capital Deployed" },
    { value: String(metrics.deal_count), label: "Active Deals" },
    { value: String(metrics.vintage_year), label: "Vintage Year" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="text-[28px] font-light text-white">{item.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-[#86868B]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

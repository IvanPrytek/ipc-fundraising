import FadeIn from "@/components/ui/FadeIn";
import PageBackground from "@/components/ui/PageBackground";

const CASE_STUDIES = [
  {
    sector: "Business Services",
    type: "MBO",
    headline: "[Company name]",
    revenue: "$[X]M revenue",
    outcome: "[Outcome description — e.g. 3x revenue growth, expanded into new markets]",
    year: "2024",
  },
  {
    sector: "Healthcare Services",
    type: "MBI",
    headline: "[Company name]",
    revenue: "$[X]M revenue",
    outcome: "[Outcome description — e.g. zero employee turnover, successful succession]",
    year: "2024",
  },
  {
    sector: "Niche Manufacturing",
    type: "MBO",
    headline: "[Company name]",
    revenue: "$[X]M revenue",
    outcome: "[Outcome description — e.g. operational improvements, margin expansion]",
    year: "2023",
  },
  {
    sector: "Industrial Services",
    type: "MBI",
    headline: "[Company name]",
    revenue: "$[X]M revenue",
    outcome: "[Outcome description — e.g. founder stayed as advisor, new operator scaled the business]",
    year: "2023",
  },
];

export default function TrackRecordPage() {
  return (
    <PageBackground glow="top-right">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/70">
              Track Record
            </p>
            <h1 className="mt-4 text-section text-white">
              Selected transactions.
            </h1>
            <p className="mt-8 max-w-2xl text-body leading-relaxed text-white/55">
              We measure success by the businesses that thrive after
              transition — and the management teams that grow into ownership.
            </p>
          </FadeIn>

          <div className="mt-24 space-y-6">
            {CASE_STUDIES.map((deal, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-white/[0.12] md:p-10"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-champagne/20 bg-champagne/[0.06] px-3 py-0.5 text-[11px] text-champagne/70">
                    {deal.type}
                  </span>
                  <span className="text-[11px] text-white/25">{deal.sector}</span>
                  <span className="text-[11px] text-white/25">·</span>
                  <span className="text-[11px] text-white/25">{deal.year}</span>
                </div>
                <h3 className="mt-5 text-xl text-white">{deal.headline}</h3>
                <p className="mt-1 text-sm text-white/30">{deal.revenue}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/40">
                  {deal.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

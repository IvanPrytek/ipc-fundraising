import FadeIn from "@/components/ui/FadeIn";
import PageBackground from "@/components/ui/PageBackground";

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
              Selected transactions
            </h1>
            <p className="mt-8 max-w-2xl text-body leading-relaxed text-white/55">
              We measure success by the businesses that thrive after
              transition, and the management teams that grow into ownership
            </p>
          </FadeIn>

          {/* IPC Case Study */}
          <div className="mt-24">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-champagne/20 bg-champagne/[0.06] px-3 py-0.5 text-[11px] text-champagne/70">
                  MBO + Roll-Up
                </span>
                <span className="text-[11px] text-white/25">
                  Vocational Education
                </span>
                <span className="text-[11px] text-white/25">·</span>
                <span className="text-[11px] text-white/25">Israel</span>
                <span className="text-[11px] text-white/25">·</span>
                <span className="text-[11px] text-white/25">2026</span>
              </div>

              <h3 className="mt-5 text-xl text-white">
                IPC, Elevation & GUS Consolidation
              </h3>
              <p className="mt-1 text-sm text-white/30">
                63M+ NIS consolidated revenue
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne/50">
                    The Business
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/45">
                    IPC (Israel Professional College) is a vocational education
                    provider delivering hands-on, industry-aligned training across
                    25+ programs in tech, finance, and healthcare. Founded in 2020,
                    the company grew to 41M NIS in revenue with strong margins and
                    a scalable digital delivery model
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne/50">
                    The Opportunity
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/45">
                    The founders were ready to focus on a new venture and willing
                    to sell on attractive terms. The Israeli education market
                    remained resilient but highly fragmented, with no dominant
                    market leader
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne/50">
                    What We Did
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/45">
                    We structured a management buyout of IPC and simultaneously
                    merged it with two complementary players: Elevation (a B2B
                    corporate education company specializing in academy-as-a-service)
                    and GUS (an international education group bringing HighQ and INT
                    College into the fold). Three entities consolidated into one
                    operating company with two revenue-generating brands and a
                    structurally lower cost base
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne/50">
                    Strategic Alignment
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/45">
                    We helped the combined entity align on a unified growth
                    strategy: consolidated marketing and sales under a single
                    operational backbone, merged headquarters for immediate
                    overhead savings, and positioned AI-powered courses as the
                    central growth engine. The result is a full-cycle human capital
                    value chain covering school preparation, career-track vocational
                    training, and enterprise B2B/B2G workforce development
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne/50">
                    Outcome
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/45">
                    A consolidated education platform with 63M+ NIS in revenue,
                    20%+ EBITDA margins, and a clear path to 110M+ NIS by 2030.
                    Immediate market leader in Israeli vocational education with
                    expansion potential into the $3B+ GCC EdTech market
                  </p>
                </div>
              </div>

              {/* Key metrics */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-8 md:grid-cols-4">
                <div>
                  <div className="text-xl font-light text-white">63M+</div>
                  <div className="mt-1 text-[11px] text-white/30">
                    NIS Revenue
                  </div>
                </div>
                <div>
                  <div className="text-xl font-light text-white">3</div>
                  <div className="mt-1 text-[11px] text-white/30">
                    Companies Merged
                  </div>
                </div>
                <div>
                  <div className="text-xl font-light text-white">20%+</div>
                  <div className="mt-1 text-[11px] text-white/30">
                    EBITDA Margin
                  </div>
                </div>
                <div>
                  <div className="text-xl font-light text-white">110M+</div>
                  <div className="mt-1 text-[11px] text-white/30">
                    NIS Target (2030)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

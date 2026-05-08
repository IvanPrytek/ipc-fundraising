"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import PageBackground from "@/components/ui/PageBackground";
import { Banknote, PenTool, Users, TrendingUp } from "lucide-react";

const FAQS = [
  {
    q: "How much of our own money do we need?",
    a: "Typically 10–30% of equity comes from management rollover. We structure it to be meaningful but not life-altering. The goal is alignment, not financial strain.",
  },
  {
    q: "What if the owner isn't ready to sell?",
    a: "That's fine. We work on the owner's timeline. Some conversations take months before a deal is even on the table. We're patient capital.",
  },
  {
    q: "What changes after close?",
    a: "Day-to-day? You run the business. We provide board-level governance, capital for growth, and a network of operators who've been where you are. We're not looking over your shoulder — we're in the background.",
  },
  {
    q: "Can we bring the deal to you?",
    a: "Yes. If you've identified a business or you're already managing one where the owner is exploring options, come talk to us early. We prefer to be involved before terms are set.",
  },
];


export default function ForTeamsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageBackground glow="top-right">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/70">
              For Management Teams
            </p>
            <h1 className="mt-4 text-section text-white">
              You know the business better than anyone. Now own it.
            </h1>
          </FadeIn>

          <div className="mt-12 max-w-2xl">
            <FadeIn delay={0.05}>
              <p className="text-body leading-relaxed text-white/50">
                You&apos;ve been running the operations, managing the clients,
                leading the team. When the founder is ready to exit, you&apos;re
                the natural successor. You just need the capital and structure.
              </p>
            </FadeIn>
          </div>

          {/* What we bring — same 2x2 grid as for-owners */}
          <div className="mt-32">
            <FadeIn>
              <h2 className="text-xl text-white">What we bring</h2>
            </FadeIn>

            <div className="mt-14 grid gap-12 md:grid-cols-2">
              <div className="flex gap-5">
                <Banknote className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Acquisition capital</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    We fund the buyout. You don&apos;t need to personally
                    finance the purchase — we provide equity and arrange
                    the debt.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <PenTool className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Deal structuring</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    Legal, financial, tax — we handle the complexity. You focus
                    on running the business through the transition.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <Users className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Governance, not oversight</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    Board-level guidance, strategic planning, and a network of
                    operators who&apos;ve done this before. We&apos;re not
                    looking over your shoulder.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Growth capital</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    The buyout is the beginning. Post-close funding for
                    acquisitions, expansion, or operational improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Gantt timeline */}
          <div className="mt-36 border-t border-white/[0.06] pt-14">
            <p className="text-sm text-white/35">Typical timeline</p>

            <div className="mt-10 overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Month axis: 1–6 */}
                <div className="grid grid-cols-6 border-b border-white/[0.06] pb-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="text-center text-[11px] text-white/25">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Gantt bars */}
                <div className="mt-6 space-y-3">
                  {[
                    { label: "First conversation", start: 0, end: 1 },
                    { label: "Assessment", start: 1, end: 3 },
                    { label: "Deal structuring", start: 3, end: 5 },
                    { label: "Close", start: 5, end: 6 },
                  ].map((step, i) => {
                    const leftPct = (step.start / 6) * 100;
                    const widthPct = ((step.end - step.start) / 6) * 100;

                    return (
                      <div key={i} className="relative" style={{ height: 36 }}>
                        <div
                          className="absolute flex items-center justify-center rounded border border-champagne/20 bg-champagne/[0.06]"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            height: 32,
                          }}
                        >
                          <span className="text-[12px] text-white/60">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-36">
            <p className="text-sm text-white/35">Questions we hear</p>
            <div className="mt-8 divide-y divide-white/[0.06]">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between py-6 text-left"
                  >
                    <span className="text-[17px] text-white/80">{faq.q}</span>
                    <span
                      className={`ml-6 text-sm text-white/25 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === i ? "auto" : 0,
                      opacity: openFaq === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-[15px] leading-relaxed text-white/40">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <Button href="/contact" variant="light">
              Let&apos;s Talk
            </Button>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

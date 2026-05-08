"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import PageBackground from "@/components/ui/PageBackground";
import { Wallet, PieChart, UserSearch, Armchair } from "lucide-react";

const FAQS = [
  {
    q: "Will my employees trust the new owner?",
    a: "That's usually the first concern — and it should be. We don't parachute in a stranger. The incoming operator meets your team, understands the culture, and earns trust before anything changes. In most of our transitions, employee turnover stays at or below historical levels.",
  },
  {
    q: "Do I have to leave?",
    a: "Not unless you want to. Most founders stay 12–24 months in an advisory or board role. Some stay longer. We structure around your preference, not a playbook.",
  },
  {
    q: "How do you find the right person?",
    a: "Our operator network is built over years — executives who've run $10M–$200M businesses in similar industries. We introduce 2–3 vetted candidates. You choose.",
  },
  {
    q: "What if the deal falls apart mid-process?",
    a: "No fees, no obligations until close. If fit isn't right, we part ways. We've walked away from deals — and so have founders. That's how it should work.",
  },
];

const TIMELINE = [
  { label: "Discovery" },
  { label: "Sourcing" },
  { label: "Structuring" },
  { label: "Close" },
];

export default function ForOwnersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageBackground glow="top-left">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/70">
              For Business Owners
            </p>
            <h1 className="mt-4 text-section text-white">
              Your business deserves a succession plan, not a fire sale.
            </h1>
          </FadeIn>

          <div className="mt-12 max-w-2xl">
            <FadeIn delay={0.05}>
              <p className="text-body leading-relaxed text-white/50">
                You&apos;ve built something real. When you&apos;re ready to step
                back — partially or fully — we help you find the right operator,
                structure the right deal, and protect what you&apos;ve spent
                decades building.
              </p>
            </FadeIn>
          </div>

          {/* The deal — equal 2x2 grid */}
          <div className="mt-32">
            <FadeIn>
              <h2 className="text-xl text-white">The deal, from your side</h2>
            </FadeIn>

            <div className="mt-14 grid gap-12 md:grid-cols-2">
              <div className="flex gap-5">
                <Wallet className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Liquidity</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    Cash at close. You don&apos;t wait for a second event to
                    access the value you&apos;ve created. Typical founder
                    take-home: 60–80% of enterprise value.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <PieChart className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Retained equity</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    Keep 15–30% ownership. Participate in the upside. When the
                    business grows under new leadership, you benefit alongside
                    the new team.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <UserSearch className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Your successor</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    We source 2–3 vetted operators from our network. You meet
                    them. You evaluate fit. You have final say. We don&apos;t
                    install anyone you haven&apos;t chosen.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <Armchair className="mt-0.5 h-6 w-6 shrink-0 text-champagne/50" />
                <div>
                  <p className="text-sm text-champagne/60">Your involvement</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                    Advisory role, board seat, or clean break. Most founders
                    stay 12–24 months. Some stay longer. We don&apos;t have a
                    template — we have a conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Gantt timeline */}
          <div className="mt-36 border-t border-white/[0.06] pt-14">
            <p className="text-sm text-white/35">Typical timeline</p>

            {/* Month scale */}
            <div className="mt-10 overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Month axis: 1–9 */}
                <div className="grid grid-cols-9 border-b border-white/[0.06] pb-3">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className="text-center text-[11px] text-white/25">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Gantt bars */}
                <div className="mt-6 space-y-3">
                  {TIMELINE.map((step, i) => {
                    const spans: [number, number][] = [[0, 2], [2, 5], [5, 8], [7, 9]];
                    const [start, end] = spans[i];
                    const leftPct = (start / 9) * 100;
                    const widthPct = ((end - start) / 9) * 100;

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
            <p className="text-sm text-white/35">Common concerns</p>
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
              Start a Conversation
            </Button>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

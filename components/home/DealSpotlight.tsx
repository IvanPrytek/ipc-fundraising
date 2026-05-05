"use client";

import FadeIn from "@/components/ui/FadeIn";
import { DEAL_SPOTLIGHTS } from "@/lib/constants";

export default function DealSpotlight() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-section text-primary">
            What this looks like.
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {DEAL_SPOTLIGHTS.map((deal, i) => (
            <FadeIn key={i} delay={0.15 * i}>
              <div className="border border-black/5 p-10">
                <p className="text-xs font-medium uppercase tracking-widest text-champagne">
                  {deal.metric}
                </p>
                <h3 className="mt-4 text-lg font-medium text-primary">
                  {deal.headline}
                </h3>
                <p className="mt-4 text-[15px] text-secondary">{deal.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

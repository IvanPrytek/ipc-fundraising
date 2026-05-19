"use client";

import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export default function FinalCTA() {
  return (
    <section className="px-6 pb-40 pt-32 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="text-section text-white">Ready to talk?</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-6 text-[17px] leading-relaxed text-white/40">
            Every relationship starts the same way: a conversation. No pitch
            decks. No pressure.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-champagne px-8 py-3.5 text-[15px] font-medium text-[#1A1A1A] transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-white/10"
            >
              Contact Us
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

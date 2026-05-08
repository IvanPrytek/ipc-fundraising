"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="px-6 pb-40 pt-20 text-white">
      <div className="mx-auto max-w-xl">
        <p className="text-[15px] leading-relaxed text-white/40">
          Every relationship starts the same way: a conversation. No pitch
          decks. No pressure
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="text-[15px] text-white/60 transition-colors duration-500 hover:text-white"
          >
            Get in touch →
          </Link>
        </div>
      </div>
    </section>
  );
}

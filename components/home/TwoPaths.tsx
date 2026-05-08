"use client";

import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { TWO_PATHS } from "@/lib/constants";

function PathCard({
  data,
}: {
  data: {
    title: string;
    headline: string;
    body: string;
    cta: { label: string; href: string };
  };
}) {
  return (
    <Link
      href={data.cta.href}
      className="group relative block overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] p-8 transition-all duration-500 hover:border-champagne/30 hover:bg-white/[0.04] md:p-10"
    >
      <span className="text-xs font-medium uppercase tracking-widest text-champagne/50">
        {data.title}
      </span>
      <h3 className="mt-5 text-xl leading-snug text-white md:text-[22px]">
        {data.headline}
      </h3>
      <p className="mt-4 text-[15px] leading-relaxed text-white/40">
        {data.body}
      </p>
      <span className="mt-8 inline-flex items-center gap-2 text-[14px] text-white/60 transition-all duration-500 group-hover:gap-3 group-hover:text-champagne">
        {data.cta.label}
      </span>
    </Link>
  );
}

export default function TwoPaths() {
  return (
    <section id="two-paths" className="px-6 py-28 text-white">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <h2 className="text-section text-white">How we partner</h2>
        </FadeIn>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <PathCard data={TWO_PATHS.mbo} />
          <PathCard data={TWO_PATHS.mbi} />
        </div>
      </div>
    </section>
  );
}

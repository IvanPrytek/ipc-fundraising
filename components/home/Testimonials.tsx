"use client";

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";

export default function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
            {/* Photo */}
            <div className="shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full ring-1 ring-white/10">
                <Image
                  src="/doron-alter.png"
                  alt="Doron Alter"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Quote */}
            <blockquote>
              <p className="text-xl font-light leading-relaxed text-white/60 md:text-[22px] md:leading-relaxed">
                &ldquo;Other firms wanted to install their own people. Ownera
                backed the management team that was already there. That&apos;s
                why the transition was seamless and the business kept
                growing.&rdquo;
              </p>
              <footer className="mt-8">
                <cite className="block text-sm not-italic text-white/40">
                  Doron Alter
                </cite>
                <span className="text-sm text-white/25">
                  CEO
                </span>
                <span className="mx-1.5 text-sm text-white/15">·</span>
                <span className="text-sm text-white/20">
                  Vocational Education Company, $10M Revenue
                </span>
              </footer>
            </blockquote>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

"use client";

import FadeIn from "@/components/ui/FadeIn";

export default function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
            {/* Photo */}
            <div className="shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10">
                {/* Replace src with actual founder photo */}
                <div className="flex h-full w-full items-center justify-center text-2xl font-extralight text-white/20">
                  R
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote>
              <p className="text-xl font-light leading-relaxed text-white/60 md:text-[22px] md:leading-relaxed">
                &ldquo;Most PE firms showed up with a spreadsheet. These
                partners showed up with questions about our people, our clients,
                our culture. That&apos;s why we chose them.&rdquo;
              </p>
              <footer className="mt-8">
                <cite className="block text-sm not-italic text-white/40">
                  Retiring founder
                </cite>
                <span className="text-sm text-white/20">
                  Business services, $30M revenue
                </span>
              </footer>
            </blockquote>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

import FadeIn from "@/components/ui/FadeIn";
import Testimonials from "@/components/home/Testimonials";
import PageBackground from "@/components/ui/PageBackground";
import { SITE_NAME, REGIONS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <PageBackground glow="center">
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h1 className="text-section text-white">About {SITE_NAME}.</h1>
          </FadeIn>

          <div className="mt-20 max-w-2xl space-y-6">
            <FadeIn>
              <p className="text-body leading-relaxed text-white/55">
                We believe the best ownership transitions happen when the people
                who know the business best are at the centre of the deal.
                Whether that&apos;s the existing management team stepping up, or
                a founder finding the right successor while staying involved.
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-body leading-relaxed text-white/55">
                For founders who aren&apos;t ready to walk away, our Management
                Buy-In path offers partial liquidity, continued equity
                participation, and a handpicked successor. You get cash off
                the table — and you stay part of the story.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-body leading-relaxed text-white/55">
                We are not financial engineers. We invest in the
                lower-mid-market — where relationships matter, where operational
                excellence drives returns, and where the founder&apos;s legacy
                is worth preserving.
              </p>
            </FadeIn>
          </div>

          <div className="mt-28 border-t border-white/[0.06] pt-12">
            <FadeIn>
              <h2 className="text-xl text-white">Where we operate.</h2>
            </FadeIn>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {REGIONS.map((region, i) => (
                <FadeIn key={region.name} delay={0.06 * i}>
                  <div>
                    <h3 className="text-[15px] text-white/70">{region.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/35">
                      {region.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className="mt-20 border-t border-white/[0.06] pt-10">
            <FadeIn>
              <p className="text-sm text-white/35">
                Institutional investors —{" "}
                <a
                  href="/contact"
                  className="text-white/55 transition-colors duration-500 hover:text-white"
                >
                  contact us directly
                </a>
                .
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Testimonials />
    </PageBackground>
  );
}

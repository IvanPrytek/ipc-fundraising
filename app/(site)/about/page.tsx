import FadeIn from "@/components/ui/FadeIn";
import Testimonials from "@/components/home/Testimonials";
import PageBackground from "@/components/ui/PageBackground";
import { SITE_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <PageBackground glow="center">
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h1 className="text-section text-white">About {SITE_NAME}</h1>
          </FadeIn>

          <div className="mt-20 max-w-2xl space-y-6">
            <FadeIn>
              <p className="text-body leading-relaxed text-white/55">
                We sit at the intersection of two moments: a founder ready to
                step back and a management team ready to step up. Our job is
                to make sure both sides get it right
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-body leading-relaxed text-white/55">
                Our deals start with people, not spreadsheets. Who stays, who
                leads, how the culture survives the transition. The financial
                structure follows
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-body leading-relaxed text-white/55">
                We focus on the lower mid-market, where businesses are built on
                relationships, not systems. Where operational excellence drives
                returns and where getting the transition right matters more than
                getting it fast
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="border-t border-white/[0.06] pt-10">
            <FadeIn>
              <p className="text-sm text-white/35">
                Institutional investors,{" "}
                <a
                  href="/contact"
                  className="text-white/55 transition-colors duration-500 hover:text-white"
                >
                  contact us directly
                </a>
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

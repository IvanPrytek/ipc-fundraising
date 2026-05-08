import FadeIn from "@/components/ui/FadeIn";
import Testimonials from "@/components/home/Testimonials";
import PageBackground from "@/components/ui/PageBackground";
import { SITE_NAME } from "@/lib/constants";

const TEAM = [
  {
    name: "Jon Doe",
    role: "Managing Partner",
    bio: "[Background — e.g. 20 years in PE, previously at X. Led Y transactions across Z sectors.]",
    initials: "JD",
  },
  {
    name: "Jon Doe",
    role: "Partner",
    bio: "[Background — e.g. Former operator, ran a $100M services business. Focuses on MBI sourcing and operator matching.]",
    initials: "JD",
  },
  {
    name: "Jon Doe",
    role: "Principal",
    bio: "[Background — e.g. Investment banking background, leads deal structuring and due diligence.]",
    initials: "JD",
  },
];

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
                We back management teams who buy the businesses they run,
                and we help founders find the right successor when there
                isn&apos;t one inside the company
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-body leading-relaxed text-white/55">
                Not every founder wants a clean exit. Our MBI path offers
                liquidity, retained equity, and a successor you&apos;ve chosen.
                You stay involved on your terms
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-body leading-relaxed text-white/55">
                We help founders get liquidity while ensuring their business
                continues thriving under the right leadership. Lower mid-market.
                Relationship-driven. We invest where operational excellence
                drives returns and where the founder&apos;s legacy is worth
                preserving
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Team */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <h2 className="text-section text-white">Who we are</h2>
            <p className="mt-8 max-w-2xl text-body leading-relaxed text-white/55">
              Operators, investors, and advisors with decades in the lower
              mid-market. Every side of a management transition, from every
              seat at the table
            </p>
          </FadeIn>

          <div className="mt-24 space-y-12">
            {TEAM.map((person, i) => (
              <FadeIn key={i} delay={0.06 * i}>
                <div className="flex flex-col gap-8 border-t border-white/[0.06] pt-10 md:flex-row md:items-start md:gap-12">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
                    <span className="text-2xl font-extralight text-white/20">
                      {person.initials}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl text-white">{person.name}</h3>
                    <p className="mt-1 text-sm text-champagne/60">
                      {person.role}
                    </p>
                    <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/40">
                      {person.bio}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-20 border-t border-white/[0.06] pt-10">
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

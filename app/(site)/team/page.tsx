import FadeIn from "@/components/ui/FadeIn";
import PageBackground from "@/components/ui/PageBackground";

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

export default function TeamPage() {
  return (
    <PageBackground glow="center">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/70">
              Team
            </p>
            <h1 className="mt-4 text-section text-white">Who we are</h1>
            <p className="mt-8 max-w-2xl text-body leading-relaxed text-white/55">
              Operators, investors, and advisors who&apos;ve spent their careers
              in the lower mid-market. We&apos;ve been on every side of a
              management transition.
            </p>
          </FadeIn>

          <div className="mt-24 space-y-12">
            {TEAM.map((person, i) => (
              <div
                key={i}
                className="flex flex-col gap-8 border-t border-white/[0.06] pt-10 md:flex-row md:items-start md:gap-12"
              >
                {/* Photo placeholder */}
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
                  <span className="text-2xl font-extralight text-white/20">
                    {person.initials}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h2 className="text-xl text-white">{person.name}</h2>
                  <p className="mt-1 text-sm text-champagne/60">{person.role}</p>
                  <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/40">
                    {person.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

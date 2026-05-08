import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import PageBackground from "@/components/ui/PageBackground";
import { SECTORS } from "@/lib/constants";

const SECTOR_IMAGES: Record<string, string> = {
  "Business Services": "/sectors/business-services.jpg",
  "Healthcare Services": "/sectors/healthcare.jpg",
  "Niche Manufacturing": "/sectors/manufacturing.jpg",
  "Industrial Services": "/sectors/industrial.jpg",
};

const TIER2 = [
  "Value-Added Distribution",
  "Tech-Enabled Services",
  "Financial Services (Niche)",
  "Consumer Services",
  "Defence & Aerospace",
  "Food & Beverage",
];

export default function SectorsPage() {
  return (
    <PageBackground glow="top-left">
      <section className="px-6 pb-32 pt-16">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-champagne/70">
              Investment Focus
            </p>
            <h1 className="mt-4 text-section text-white">Where we invest</h1>
            <p className="mt-8 max-w-2xl text-body leading-relaxed text-white/55">
              Stable cash flows. Fragmented markets. Founder-led businesses
              where management continuity is essential to value.
            </p>
          </FadeIn>

          <div className="mt-24 grid gap-6 md:grid-cols-2">
            {SECTORS.map((sector, i) => (
              <div
                key={sector.name}
                className="group relative overflow-hidden rounded-lg border border-white/[0.06] transition-all duration-500 hover:border-white/15"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={SECTOR_IMAGES[sector.name]}
                    alt={sector.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: "brightness(0.5) saturate(0.3)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-lg text-white">{sector.name}</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/40">
                    {sector.thesis}
                  </p>
                  <p className="mt-3 text-xs text-white/20">{sector.dealLane}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 border-t border-white/[0.06] pt-10">
            <p className="text-sm text-white/40">
              We also evaluate opportunities in{" "}
              {TIER2.map((s, i) => (
                <span key={s}>
                  <span className="text-white/60">{s}</span>
                  {i < TIER2.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>

          <div className="mt-16">
            <p className="text-[15px] text-white/40">
              Don&apos;t see your industry?{" "}
              <a
                href="/contact"
                className="text-white/60 transition-colors duration-500 hover:text-white"
              >
                Talk to us.
              </a>
            </p>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}

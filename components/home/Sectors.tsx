"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { SECTORS } from "@/lib/constants";

export default function Sectors() {
  return (
    <section className="bg-warm-white px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-section text-primary">
            Where we invest.
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {SECTORS.map((sector, i) => (
            <FadeIn key={sector.name} delay={0.1 * i}>
              <motion.div
                whileHover={{ y: -4 }}
                className="border border-champagne/10 bg-surface p-8 transition-shadow hover:shadow-md hover:border-champagne/20"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-champagne">
                  {sector.multiples} EV/EBITDA
                </p>
                <h3 className="mt-3 text-xl font-medium text-primary">
                  {sector.name}
                </h3>
                <p className="mt-3 text-[15px] text-secondary">
                  {sector.thesis}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <p className="mt-12 text-center text-[15px] text-secondary">
            We also invest in distribution, tech-enabled services, financial
            services, and more.{" "}
            <Link
              href="/sectors"
              className="text-primary transition-colors hover:text-champagne"
            >
              See all sectors →
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

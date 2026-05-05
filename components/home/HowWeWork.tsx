"use client";

import FadeIn from "@/components/ui/FadeIn";
import { STEPS } from "@/lib/constants";

export default function HowWeWork() {
  return (
    <section className="bg-surface px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-section text-primary">
            How we work.
          </h2>
        </FadeIn>
        <div className="mt-20 grid gap-12 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={0.15 * i}>
              <div className="text-center">
                <span className="text-5xl font-extralight text-champagne">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-medium text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] text-secondary">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

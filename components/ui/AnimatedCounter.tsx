"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  label: string;
  dark?: boolean;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  label,
  dark = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${Math.round(v)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [spring, prefix, suffix]);

  return (
    <div ref={ref} className="text-center">
      <span
        ref={displayRef}
        className={`block text-4xl font-extralight ${dark ? "text-champagne" : "text-primary"}`}
      >
        {prefix}0{suffix}
      </span>
      <span className={`mt-2 block text-sm ${dark ? "text-white/50" : "text-secondary"}`}>
        {label}
      </span>
    </div>
  );
}

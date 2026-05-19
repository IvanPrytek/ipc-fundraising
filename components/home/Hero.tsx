"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TextRotate } from "@/components/ui/TextRotate";
import SilkBackground from "@/components/ui/SilkBackground";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-white">
      <SilkBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <TextRotate
            texts={[
              "Step up to ownership",
              "Exit without walking away",
              "Own what you've built",
              "Exit on your terms",
            ]}
            mainClassName="text-hero font-extralight tracking-tight overflow-hidden justify-center"
            staggerFrom="last"
            staggerDuration={0.025}
            rotationInterval={4000}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14"
        >
          <Link
            href="#two-paths"
            className="text-[15px] text-white/40 transition-colors duration-500 hover:text-white"
          >
            Learn more ↓
          </Link>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-64 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
    </section>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  dark?: boolean;
}

export default function DotPattern({ className, dark = false }: DotPatternProps) {
  return (
    <div
      className={cn("pointer-events-none h-8 w-full", className)}
      style={{
        backgroundImage: `radial-gradient(circle, ${
          dark ? "rgba(196,176,137,0.4)" : "rgba(196,176,137,0.35)"
        } 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
        maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
      }}
    />
  );
}

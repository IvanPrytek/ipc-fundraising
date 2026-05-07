"use client";

import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
  label?: string;
}

export default function VisibilityToggle({
  isVisible,
  onToggle,
  label,
}: VisibilityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-[10px] uppercase tracking-[0.5px] text-[#86868B]">
          {label}
        </span>
      )}
      <button
        onClick={() => onToggle(!isVisible)}
        className={cn(
          "relative h-[18px] w-[32px] rounded-full transition-colors duration-200",
          isVisible ? "bg-champagne" : "bg-[#333]"
        )}
        aria-label={isVisible ? "Hide from LPs" : "Show to LPs"}
      >
        <div
          className={cn(
            "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-[left] duration-200",
            isVisible ? "left-[16px]" : "left-[2px]"
          )}
        />
      </button>
    </div>
  );
}

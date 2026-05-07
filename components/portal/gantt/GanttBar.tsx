"use client";

import { cn } from "@/lib/utils";

interface GanttBarProps {
  leftPercent: number;
  widthPercent: number;
  progress: number;
  color: string;
  isSubTask?: boolean;
  onClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  green: "from-emerald-600 to-emerald-400",
  blue: "from-blue-600 to-blue-500",
  amber: "from-amber-600 to-amber-400",
  champagne: "from-champagne to-champagne-light",
};

export default function GanttBar({
  leftPercent,
  widthPercent,
  progress,
  color,
  isSubTask = false,
  onClick,
}: GanttBarProps) {
  const gradient = COLOR_MAP[color] ?? COLOR_MAP["blue"];

  return (
    <div
      className={cn(
        "absolute flex cursor-pointer items-center justify-between rounded-md bg-gradient-to-r px-2 text-[10px] transition-shadow duration-200 hover:shadow-[0_0_0_2px_rgba(196,176,137,0.4)]",
        gradient,
        isSubTask ? "top-[13px] h-[18px] opacity-80" : "top-[9px] h-[26px]",
        color === "champagne" || color === "amber"
          ? "text-[#1A1A1A]"
          : "text-white/80"
      )}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }}
      onClick={onClick}
    >
      <span className="font-medium">{progress}%</span>
    </div>
  );
}

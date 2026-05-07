"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GanttBarProps {
  leftPercent: number;
  widthPercent: number;
  progress: number;
  color: string;
  isSubTask?: boolean;
  onDragEnd?: (newLeftPercent: number, newWidthPercent: number) => void;
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
  onDragEnd,
  onClick,
}: GanttBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    mode: "move" | "resize";
    startX: number;
    startLeft: number;
    startWidth: number;
    parentWidth: number;
  } | null>(null);

  const gradient = COLOR_MAP[color] ?? COLOR_MAP["blue"];

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize") => {
      e.preventDefault();
      e.stopPropagation();
      const bar = barRef.current;
      if (!bar) return;
      const parent = bar.parentElement;
      if (!parent) return;

      bar.setPointerCapture(e.pointerId);
      dragState.current = {
        mode,
        startX: e.clientX,
        startLeft: leftPercent,
        startWidth: widthPercent,
        parentWidth: parent.getBoundingClientRect().width,
      };
    },
    [leftPercent, widthPercent]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const deltaX = e.clientX - ds.startX;
    const deltaPct = (deltaX / ds.parentWidth) * 100;

    const bar = barRef.current;
    if (!bar) return;

    if (ds.mode === "move") {
      const newLeft = Math.max(0, Math.min(100 - ds.startWidth, ds.startLeft + deltaPct));
      bar.style.left = `${newLeft}%`;
    } else {
      const newWidth = Math.max(2, ds.startWidth + deltaPct);
      bar.style.width = `${newWidth}%`;
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      dragState.current = null;

      const bar = barRef.current;
      if (!bar) return;
      bar.releasePointerCapture(e.pointerId);

      const deltaX = e.clientX - ds.startX;
      const deltaPct = (deltaX / ds.parentWidth) * 100;

      if (ds.mode === "move") {
        const newLeft = Math.max(0, Math.min(100 - ds.startWidth, ds.startLeft + deltaPct));
        onDragEnd?.(newLeft, ds.startWidth);
      } else {
        const newWidth = Math.max(2, ds.startWidth + deltaPct);
        onDragEnd?.(ds.startLeft, newWidth);
      }
    },
    [onDragEnd]
  );

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute flex cursor-grab items-center justify-between rounded-md bg-gradient-to-r px-2 text-[10px] transition-shadow duration-200 hover:shadow-[0_0_0_2px_rgba(196,176,137,0.4)]",
        gradient,
        isSubTask ? "top-[13px] h-[18px] opacity-80" : "top-[9px] h-[26px]",
        color === "champagne" || color === "amber" ? "text-[#1A1A1A]" : "text-white/80"
      )}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }}
      onClick={onClick}
      onPointerDown={(e) => handlePointerDown(e, "move")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <span className="font-medium">{progress}%</span>
      {!isSubTask && (
        <div
          className="h-4 w-1.5 cursor-ew-resize rounded-sm bg-white/20"
          onPointerDown={(e) => {
            e.stopPropagation();
            handlePointerDown(e, "resize");
          }}
        />
      )}
    </div>
  );
}

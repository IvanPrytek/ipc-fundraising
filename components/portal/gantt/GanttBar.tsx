"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GanttBarProps {
  leftPercent: number;
  widthPercent: number;
  color: string;
  isSubTask?: boolean;
  onClick?: () => void;
  onDragEnd?: (newLeftPercent: number, newWidthPercent: number) => void;
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
  color,
  isSubTask = false,
  onClick,
  onDragEnd,
}: GanttBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    mode: "move" | "resize";
    startX: number;
    startLeft: number;
    startWidth: number;
    parentWidth: number;
    didDrag: boolean;
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
        didDrag: false,
      };
    },
    [leftPercent, widthPercent]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;

    const deltaX = e.clientX - ds.startX;
    if (Math.abs(deltaX) > 3) ds.didDrag = true;
    if (!ds.didDrag) return;

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

      if (!ds.didDrag) {
        // Was a click, not a drag
        onClick?.();
        return;
      }

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
    [onClick, onDragEnd]
  );

  return (
    <div
      ref={barRef}
      className={cn(
        "absolute cursor-grab rounded-md bg-gradient-to-r transition-shadow duration-200 hover:shadow-[0_0_0_2px_rgba(196,176,137,0.4)] active:cursor-grabbing",
        gradient,
        isSubTask ? "top-[13px] h-[18px] opacity-80" : "top-[9px] h-[26px]"
      )}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      }}
      onPointerDown={(e) => handlePointerDown(e, "move")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Resize handle on right edge */}
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
        onPointerDown={(e) => {
          e.stopPropagation();
          handlePointerDown(e, "resize");
        }}
      />
    </div>
  );
}

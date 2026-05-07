import { cn } from "@/lib/utils";
import type { MilestoneStatus } from "@/lib/portal/types";

const STATUS_STYLES: Record<MilestoneStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Completed" },
  in_progress: { bg: "bg-amber-500/15", text: "text-amber-400", label: "In Progress" },
  pending: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Pending" },
  delayed: { bg: "bg-red-500/15", text: "text-red-400", label: "Delayed" },
};

const DOT_COLORS: Record<MilestoneStatus, string> = {
  completed: "bg-emerald-400",
  in_progress: "bg-amber-400",
  pending: "bg-gray-500",
  delayed: "bg-red-400",
};

export function StatusBadge({ status }: { status: MilestoneStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "rounded-[10px] px-2 py-0.5 text-[11px]",
        style.bg,
        style.text
      )}
    >
      {style.label}
    </span>
  );
}

export function StatusDot({ status }: { status: MilestoneStatus }) {
  return (
    <div
      className={cn("h-2.5 w-2.5 flex-shrink-0 rounded-full", DOT_COLORS[status])}
    />
  );
}

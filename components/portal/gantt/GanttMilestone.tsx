import { cn } from "@/lib/utils";

interface GanttMilestoneProps {
  leftPercent: number;
  completed: boolean;
}

export default function GanttMilestone({
  leftPercent,
  completed,
}: GanttMilestoneProps) {
  return (
    <div
      className={cn(
        "absolute top-[13px] h-[18px] w-[18px] rotate-45 rounded-[3px] border-2 border-champagne",
        completed ? "bg-champagne" : "bg-[#1A1A1A]"
      )}
      style={{ left: `${leftPercent}%` }}
    />
  );
}

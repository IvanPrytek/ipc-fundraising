"use client";

import { use, useEffect, useState } from "react";
import { validateToken, getGanttTasks, getMilestones, getStatusUpdates, getFundMetrics } from "@/lib/portal/queries";
import { formatShortDate, getQuarterLabel } from "@/lib/portal/utils";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import PortalButton from "@/components/portal/shared/PortalButton";
import Link from "next/link";
import type { GanttTask, Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

export default function TeamDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);

      const [t, m, u, f] = await Promise.all([
        getGanttTasks(link.project_id),
        getMilestones(link.project_id),
        getStatusUpdates(link.project_id),
        getFundMetrics(link.project_id),
      ]);
      setTasks(t.filter((task) => !task.parent_id));
      setMilestones(m.slice(0, 5));
      setUpdates(u.slice(0, 1));
      setMetrics(f);
    }
    load();
  }, [token]);

  const basePath = `/portal/team/${token}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#86868B]">{getQuarterLabel()}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${basePath}/gantt`}>
            <PortalButton variant="accent">+ Add Task</PortalButton>
          </Link>
          <Link href={`${basePath}/updates`}>
            <PortalButton>+ Update</PortalButton>
          </Link>
        </div>
      </div>

      {/* Gantt Preview */}
      <section className="mb-8">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
          Pipeline Overview
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[#86868B]">
              No tasks yet.{" "}
              <Link href={`${basePath}/gantt`} className="text-champagne hover:underline">
                Add your first task
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => {
                const barColor =
                  task.color ?? (task.progress === 100 ? "#10B981" : "#3B82F6");
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <span className="w-[140px] truncate text-right text-[12px] text-[#86868B]">
                      {task.title}
                    </span>
                    <div className="relative h-6 flex-1 rounded bg-white/[0.03]">
                      <div
                        className="absolute left-0 top-0 h-full rounded"
                        style={{
                          width: `${task.progress}%`,
                          background: barColor,
                          minWidth: task.progress > 0 ? "8px" : "0",
                        }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white/70">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Milestones
          </div>
          <Link
            href={`${basePath}/milestones`}
            className="text-[12px] text-[#86868B] hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-1">
          {milestones.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-[#86868B]">
              No milestones yet.
            </p>
          ) : (
            milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3"
              >
                <StatusDot status={m.status} />
                <span className="flex-1 text-[13px] text-[#e5e5e5]">
                  {m.title}
                </span>
                <StatusBadge status={m.status} />
                <span className="text-[11px] text-[#86868B]">
                  {formatShortDate(m.due_date)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Latest Update */}
      {updates.length > 0 && (
        <section>
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            Latest Update
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-1 text-[15px] font-medium text-white">
              {updates[0].title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[#86868B]">
              {updates[0].body}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import { use, useEffect, useState, useMemo } from "react";
import { validateToken, getGanttTasks, getMilestones, getStatusUpdates, getFundMetrics, getProject } from "@/lib/portal/queries";
import { formatShortDate, getQuarterLabel } from "@/lib/portal/utils";
import { generateWeeklyReport } from "@/lib/portal/generate-report";
import { StatusBadge, StatusDot } from "@/components/portal/shared/StatusBadge";
import PortalButton from "@/components/portal/shared/PortalButton";
import Link from "next/link";
import type { GanttTask, Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

function getThisMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

function getThisSunday(): string {
  const mon = getThisMonday();
  const d = new Date(mon + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

export default function TeamDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Portfolio");
  const [allTasks, setAllTasks] = useState<GanttTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [metrics, setMetrics] = useState<FundMetrics | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [reportWeek, setReportWeek] = useState(getThisMonday);

  useEffect(() => {
    async function load() {
      const link = await validateToken(token);
      if (!link?.project_id) return;
      setProjectId(link.project_id);

      const [proj, t, m, u, f] = await Promise.all([
        getProject(link.project_id),
        getGanttTasks(link.project_id),
        getMilestones(link.project_id),
        getStatusUpdates(link.project_id),
        getFundMetrics(link.project_id),
      ]);
      if (proj) setProjectName(proj.name);
      setAllTasks(t);
      setMilestones(m);
      setUpdates(u.slice(0, 1));
      setMetrics(f);
    }
    load();
  }, [token]);

  const weekStart = getThisMonday();
  const weekEnd = getThisSunday();

  // Tasks due this week (end_date falls within Mon-Sun)
  const tasksDueThisWeek = useMemo(() => {
    return allTasks.filter(
      (t) => !t.closed && t.end_date >= weekStart && t.end_date <= weekEnd
    );
  }, [allTasks, weekStart, weekEnd]);

  // Milestones due this week
  const milestonesDueThisWeek = useMemo(() => {
    return milestones.filter(
      (m) => m.status !== "completed" && m.due_date >= weekStart && m.due_date <= weekEnd
    );
  }, [milestones, weekStart, weekEnd]);

  const basePath = `/portal/team/${token}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#86868B]">{getQuarterLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <PortalButton onClick={() => setShowWeekPicker(!showWeekPicker)}>
              ↓ Weekly Report
            </PortalButton>
            {showWeekPicker && (
              <div className="absolute right-0 top-full z-20 mt-2 w-[240px] rounded-lg border border-white/[0.08] bg-[#111] p-4 shadow-xl">
                <label className="mb-3 block text-[11px] uppercase tracking-wider text-[#86868B]">
                  Week commencing
                </label>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const d = new Date(reportWeek + "T00:00:00");
                      d.setDate(d.getDate() - 7);
                      setReportWeek(d.toISOString().split("T")[0]);
                    }}
                    className="rounded px-2 py-1 text-[14px] text-[#86868B] hover:bg-white/5 hover:text-white"
                  >
                    ←
                  </button>
                  <span className="text-[14px] font-medium text-white">
                    {new Date(reportWeek + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" – "}
                    {(() => {
                      const sun = new Date(reportWeek + "T00:00:00");
                      sun.setDate(sun.getDate() + 6);
                      return sun.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    })()}
                  </span>
                  <button
                    onClick={() => {
                      const d = new Date(reportWeek + "T00:00:00");
                      d.setDate(d.getDate() + 7);
                      setReportWeek(d.toISOString().split("T")[0]);
                    }}
                    className="rounded px-2 py-1 text-[14px] text-[#86868B] hover:bg-white/5 hover:text-white"
                  >
                    →
                  </button>
                </div>
                <p className="mb-4 text-center text-[11px] text-[#86868B]">
                  {reportWeek === getThisMonday() ? "This week" : `w/c ${new Date(reportWeek + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
                <PortalButton
                  variant="accent"
                  className="w-full"
                  onClick={() => {
                    generateWeeklyReport(allTasks, projectName, reportWeek);
                    setShowWeekPicker(false);
                  }}
                >
                  Download PDF
                </PortalButton>
              </div>
            )}
          </div>
          <Link href={`${basePath}/gantt`}>
            <PortalButton variant="accent">+ Add Task</PortalButton>
          </Link>
          <Link href={`${basePath}/updates`}>
            <PortalButton>+ Update</PortalButton>
          </Link>
        </div>
      </div>

      {/* Tasks Due This Week */}
      <section className="mb-8">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
          Due This Week
        </div>
        <div className="space-y-1.5">
          {tasksDueThisWeek.length === 0 && milestonesDueThisWeek.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="py-4 text-center text-[13px] text-[#86868B]">
                Nothing due this week
              </p>
            </div>
          ) : (
            <>
              {tasksDueThisWeek.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3"
                >
                  <div className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border border-white/20" />
                  <span className="flex-1 text-[13px] text-[#e5e5e5]">
                    {task.title}
                  </span>
                  {task.assignee && (
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#86868B]">
                      {task.assignee}
                    </span>
                  )}
                  <span className="text-[11px] text-[#86868B]">
                    {formatShortDate(task.end_date)}
                  </span>
                </div>
              ))}
              {milestonesDueThisWeek.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3"
                >
                  <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center text-[10px] text-champagne">◇</span>
                  <span className="flex-1 text-[13px] text-[#e5e5e5]">
                    {m.title}
                  </span>
                  <StatusBadge status={m.status} />
                  <span className="text-[11px] text-[#86868B]">
                    {formatShortDate(m.due_date)}
                  </span>
                </div>
              ))}
            </>
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

"use client";

import { use, useEffect, useState, useMemo } from "react";
import { validateToken, getGanttTasks, getMilestones, getStatusUpdates, getFundMetrics, getProject } from "@/lib/portal/queries";
import { formatShortDate, getQuarterLabel } from "@/lib/portal/utils";
import { generateWeeklyReport, generateTextSummary } from "@/lib/portal/generate-report";
import { StatusBadge } from "@/components/portal/shared/StatusBadge";
import PortalButton from "@/components/portal/shared/PortalButton";
import Link from "next/link";
import type { GanttTask, Milestone, StatusUpdate, FundMetrics } from "@/lib/portal/types";

function toLocalStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getSundayOf(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - dow); // back to Sunday
  return toLocalStr(d);
}

function getSaturdayOf(sunday: string): string {
  const d = parseLocal(sunday);
  d.setDate(d.getDate() + 6);
  return toLocalStr(d);
}

function shiftWeek(monday: string, delta: number): string {
  const d = parseLocal(monday);
  d.setDate(d.getDate() + delta * 7);
  return toLocalStr(d);
}

function formatWeekRange(sunday: string): string {
  const start = parseLocal(sunday).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sat = parseLocal(sunday);
  sat.setDate(sat.getDate() + 6);
  const end = sat.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${start} – ${end}`;
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
  const [copied, setCopied] = useState(false);

  const thisWeekStart = getSundayOf(new Date());
  const [dashboardWeek, setDashboardWeek] = useState(thisWeekStart);
  const [reportWeek, setReportWeek] = useState(thisWeekStart);

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

  const weekStart = dashboardWeek;
  const weekEnd = getSaturdayOf(dashboardWeek);
  const isThisWeek = dashboardWeek === thisWeekStart;

  // Group tasks: parents with their sub-tasks due in selected week
  const taskGroups = useMemo(() => {
    const parentTasks = allTasks.filter((t) => !t.parent_id);
    const childMap = new Map<string, GanttTask[]>();
    for (const t of allTasks) {
      if (t.parent_id) {
        const children = childMap.get(t.parent_id) ?? [];
        children.push(t);
        childMap.set(t.parent_id, children);
      }
    }

    const groups: { parent: GanttTask; children: GanttTask[] }[] = [];
    for (const parent of parentTasks) {
      const parentDue = !parent.closed && parent.end_date >= weekStart && parent.end_date <= weekEnd;
      const childrenDue = (childMap.get(parent.id) ?? []).filter(
        (c) => !c.closed && c.end_date >= weekStart && c.end_date <= weekEnd
      );
      if (parentDue || childrenDue.length > 0) {
        groups.push({ parent, children: childrenDue });
      }
    }
    return groups;
  }, [allTasks, weekStart, weekEnd]);

  // Milestones due in selected week
  const milestonesThisWeek = useMemo(() => {
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
                    onClick={() => setReportWeek(shiftWeek(reportWeek, -1))}
                    className="rounded px-2 py-1 text-[14px] text-[#86868B] hover:bg-white/5 hover:text-white"
                  >
                    ←
                  </button>
                  <span className="text-[14px] font-medium text-white">
                    {formatWeekRange(reportWeek)}
                  </span>
                  <button
                    onClick={() => setReportWeek(shiftWeek(reportWeek, 1))}
                    className="rounded px-2 py-1 text-[14px] text-[#86868B] hover:bg-white/5 hover:text-white"
                  >
                    →
                  </button>
                </div>
                <p className="mb-4 text-center text-[11px] text-[#86868B]">
                  {reportWeek === thisWeekStart ? "This week" : `w/c ${parseLocal(reportWeek).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
                <div className="flex flex-col gap-2">
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
                  <PortalButton
                    className="w-full"
                    onClick={async () => {
                      const text = generateTextSummary(allTasks, projectName, reportWeek);
                      await navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied!" : "Copy for WhatsApp"}
                  </PortalButton>
                </div>
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

      {/* Due This Week — with week navigation */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
            {isThisWeek ? "Due This Week" : "Due Week Of"}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDashboardWeek(shiftWeek(dashboardWeek, -1))}
              className="rounded px-2 py-0.5 text-[13px] text-[#86868B] hover:bg-white/5 hover:text-white"
            >
              ←
            </button>
            <span className="text-[12px] text-white/60">
              {formatWeekRange(dashboardWeek)}
            </span>
            <button
              onClick={() => setDashboardWeek(shiftWeek(dashboardWeek, 1))}
              className="rounded px-2 py-0.5 text-[13px] text-[#86868B] hover:bg-white/5 hover:text-white"
            >
              →
            </button>
            {!isThisWeek && (
              <button
                onClick={() => setDashboardWeek(thisWeekStart)}
                className="rounded px-2 py-0.5 text-[10px] text-champagne hover:text-champagne-light"
              >
                Today
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          {taskGroups.length === 0 && milestonesThisWeek.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="py-4 text-center text-[13px] text-[#86868B]">
                Nothing due this week
              </p>
            </div>
          ) : (
            <>
              {taskGroups.map(({ parent, children }) => (
                <div key={parent.id}>
                  <div className="flex items-center gap-3 rounded-lg border border-white/[0.04] px-4 py-3">
                    <div className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border ${parent.closed ? "border-emerald-400/60 bg-emerald-400/20" : "border-white/20"}`}>
                      {parent.closed && (
                        <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[13px] font-medium ${parent.closed ? "text-[#4B5563] line-through" : "text-[#e5e5e5]"}`}>
                        {parent.title}
                      </span>
                      {parent.notes && (
                        <p className="mt-0.5 text-[11px] leading-snug text-[#86868B]/70 line-clamp-2">
                          {parent.notes}
                        </p>
                      )}
                    </div>
                    {parent.assignee && (
                      <span className="flex-shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#86868B]">
                        {parent.assignee}
                      </span>
                    )}
                    <span className="flex-shrink-0 text-[11px] text-[#86868B]">
                      {formatShortDate(parent.end_date)}
                    </span>
                  </div>
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="ml-6 flex items-center gap-3 border-l border-white/[0.06] px-4 py-2.5"
                    >
                      <div className={`flex h-3 w-3 flex-shrink-0 items-center justify-center rounded border ${child.closed ? "border-emerald-400/60 bg-emerald-400/20" : "border-white/15"}`}>
                        {child.closed && (
                          <svg className="h-2 w-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[12px] ${child.closed ? "text-[#4B5563] line-through" : "text-[#9CA3AF]"}`}>
                          {child.title}
                        </span>
                        {child.notes && (
                          <p className="mt-0.5 text-[11px] leading-snug text-[#86868B]/60 line-clamp-2">
                            {child.notes}
                          </p>
                        )}
                      </div>
                      {child.assignee && (
                        <span className="flex-shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#86868B]">
                          {child.assignee}
                        </span>
                      )}
                      <span className="flex-shrink-0 text-[10px] text-[#86868B]">
                        {formatShortDate(child.end_date)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {milestonesThisWeek.map((m) => (
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

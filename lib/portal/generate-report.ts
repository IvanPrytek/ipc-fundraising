import { jsPDF } from "jspdf";
import type { GanttTask } from "./types";

function getWeekRange(weekCommencing?: string): { start: string; end: string } {
  let monday: Date;
  if (weekCommencing) {
    monday = new Date(weekCommencing + "T00:00:00");
  } else {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  }
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const startStr = monday.toISOString().split("T")[0];
  const endStr = sunday.toISOString().split("T")[0];
  return { start: startStr, end: endStr };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateWeeklyReport(
  allTasks: GanttTask[],
  projectName: string,
  weekCommencing?: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const champagne: [number, number, number] = [139, 115, 85];
  const darkText: [number, number, number] = [58, 58, 58];
  const grayText: [number, number, number] = [153, 153, 153];
  const lightBg: [number, number, number] = [247, 246, 244];

  // --- Header ---
  doc.setFontSize(8);
  doc.setTextColor(...grayText);
  doc.text("OWNERA CAPITAL", margin, y);
  doc.text("Confidential", pageWidth - margin, y, { align: "right" });
  y += 4;
  doc.setDrawColor(...champagne);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // --- Title ---
  doc.setFontSize(22);
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.text("Weekly Task Report", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayText);
  const { start, end } = getWeekRange(weekCommencing);
  const weekLabel = `${formatDate(start)} – ${formatDate(end)}`;
  doc.text(`${projectName}  |  ${weekLabel}`, margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    margin,
    y
  );
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Helpers ---
  const parentTasks = allTasks.filter((t) => !t.parent_id);
  const childMap = new Map<string, GanttTask[]>();
  for (const t of allTasks) {
    if (t.parent_id) {
      const children = childMap.get(t.parent_id) ?? [];
      children.push(t);
      childMap.set(t.parent_id, children);
    }
  }

  function isDueThisWeek(task: GanttTask): boolean {
    // Task is "due this week" if its end_date falls within Mon-Sun
    return task.end_date >= start && task.end_date <= end;
  }

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
      // Repeat header line
      doc.setFontSize(8);
      doc.setTextColor(...grayText);
      doc.text("OWNERA CAPITAL", margin, y);
      doc.text("Confidential", pageWidth - margin, y, { align: "right" });
      y += 4;
      doc.setDrawColor(...champagne);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    }
  }

  function drawTask(
    task: GanttTask,
    indent: number,
    showDates: boolean
  ) {
    checkPage(14);

    const x = margin + indent;

    // Checkbox
    const boxSize = 3;
    const boxY = y - boxSize + 0.5;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(x, boxY, boxSize, boxSize);
    if (task.closed) {
      doc.setDrawColor(...champagne);
      doc.setLineWidth(0.5);
      doc.line(x + 0.5, boxY + 1.5, x + 1.2, boxY + 2.5);
      doc.line(x + 1.2, boxY + 2.5, x + 2.5, boxY + 0.5);
    }

    // Title
    const titleX = x + boxSize + 2;
    doc.setFontSize(9);
    if (task.closed) {
      doc.setTextColor(...grayText);
    } else {
      doc.setTextColor(...darkText);
    }
    doc.setFont("helvetica", indent === 0 ? "bold" : "normal");
    doc.text(task.title, titleX, y);

    // Assignee
    if (task.assignee) {
      const titleWidth = doc.getTextWidth(task.title);
      doc.setFontSize(7);
      doc.setTextColor(...champagne);
      doc.text(task.assignee, titleX + titleWidth + 3, y);
    }

    // Dates on right
    if (showDates) {
      doc.setFontSize(7);
      doc.setTextColor(...grayText);
      doc.setFont("helvetica", "normal");
      const dateStr = `${formatDate(task.start_date)} – ${formatDate(task.end_date)}`;
      doc.text(dateStr, pageWidth - margin, y, { align: "right" });
    }

    y += 6;

    // Notes
    if (task.notes && indent === 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(...grayText);
      doc.setFont("helvetica", "italic");
      const lines = doc.splitTextToSize(task.notes, contentWidth - indent - 10);
      const maxLines = Math.min(lines.length, 2);
      for (let i = 0; i < maxLines; i++) {
        checkPage(5);
        doc.text(lines[i], titleX, y);
        y += 4;
      }
      y += 1;
    }
  }

  // --- SECTION 1: Open tasks due this week ---
  doc.setFontSize(8);
  doc.setTextColor(...champagne);
  doc.setFont("helvetica", "bold");
  doc.text("OPEN TASKS DUE THIS WEEK", margin, y);
  y += 3;
  doc.setDrawColor(...champagne);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 30, y);
  y += 8;

  // Build grouped open tasks: parent with due sub-tasks
  const openGroups: { parent: GanttTask; children: GanttTask[] }[] = [];
  for (const parent of parentTasks) {
    const parentDue = !parent.closed && isDueThisWeek(parent);
    const childrenDue = (childMap.get(parent.id) ?? []).filter(
      (c) => !c.closed && isDueThisWeek(c)
    );
    if (parentDue || childrenDue.length > 0) {
      openGroups.push({ parent, children: childrenDue });
    }
  }

  if (openGroups.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.text("No open tasks due this week", margin, y);
    y += 10;
  } else {
    for (const { parent, children } of openGroups) {
      drawTask(parent, 0, true);
      for (const child of children) {
        drawTask(child, 8, true);
      }
      y += 2;
    }
  }

  y += 6;

  // --- SECTION 2: All closed tasks ---
  checkPage(20);
  doc.setFontSize(8);
  doc.setTextColor(...champagne);
  doc.setFont("helvetica", "bold");
  doc.text("COMPLETED TASKS", margin, y);
  y += 3;
  doc.setDrawColor(...champagne);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 30, y);
  y += 8;

  const closedParents = parentTasks.filter((t) => t.closed);
  const closedOrphans = allTasks.filter(
    (t) => t.parent_id && t.closed
  );

  if (closedParents.length === 0 && closedOrphans.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.text("No completed tasks", margin, y);
    y += 10;
  } else {
    for (const task of closedParents) {
      drawTask(task, 0, true);
      const children = (childMap.get(task.id) ?? []).filter(
        (c) => c.closed
      );
      for (const child of children) {
        drawTask(child, 8, true);
      }
      y += 2;
    }

    // Closed sub-tasks whose parent is NOT closed
    const closedSubsWithOpenParent = closedOrphans.filter(
      (t) => !closedParents.some((p) => p.id === t.parent_id)
    );
    for (const sub of closedSubsWithOpenParent) {
      drawTask(sub, 8, true);
    }
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`Ownera_Weekly_Report_${start}.pdf`);
}

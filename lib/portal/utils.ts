export function generateToken(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getFileTypeInfo(mimeType: string): { label: string; colorClass: string } {
  if (mimeType === "application/pdf") return { label: "PDF", colorClass: "bg-red-500/15 text-red-400" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return { label: "XLS", colorClass: "bg-emerald-500/15 text-emerald-400" };
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return { label: "PPT", colorClass: "bg-amber-500/15 text-amber-400" };
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { label: "DOC", colorClass: "bg-blue-500/15 text-blue-400" };
  return { label: "FILE", colorClass: "bg-white/10 text-white/50" };
}

export function dateToPercent(
  date: string,
  rangeStart: Date,
  rangeEnd: Date
): number {
  const d = new Date(date);
  const total = rangeEnd.getTime() - rangeStart.getTime();
  if (total <= 0) return 0;
  const offset = d.getTime() - rangeStart.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

export function percentToDate(
  percent: number,
  rangeStart: Date,
  rangeEnd: Date
): Date {
  const total = rangeEnd.getTime() - rangeStart.getTime();
  return new Date(rangeStart.getTime() + (percent / 100) * total);
}

export function getQuarterLabel(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

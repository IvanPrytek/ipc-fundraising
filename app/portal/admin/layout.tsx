import { requireRole } from "@/lib/auth/session";
import AdminShell from "@/components/portal/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <AdminShell>{children}</AdminShell>;
}

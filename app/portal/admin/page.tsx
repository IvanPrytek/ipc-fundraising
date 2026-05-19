import { listUsers } from "@/lib/auth/actions";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const { users } = await listUsers();

  const adminCount = users.filter((u: any) => u.role === "admin").length;
  const teamCount = users.filter((u: any) => u.role === "team").length;
  const lpCount = users.filter((u: any) => u.role === "lp").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-medium text-white">Admin Dashboard</h1>
        <p className="mt-1 text-[13px] text-[#86868B]">
          Manage portal users and settings.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: adminCount },
          { label: "Team Members", value: teamCount },
          { label: "LP Users", value: lpCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[2px] text-champagne">
              {stat.label}
            </div>
            <div className="mt-2 text-[28px] font-light text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/portal/admin/users"
          className="rounded-lg border border-white/15 px-4 py-2 text-[13px] text-[#e5e5e5] transition-colors hover:border-white/30"
        >
          Manage Users
        </Link>
        <Link
          href="/portal/admin/users/invite"
          className="rounded-lg bg-champagne px-4 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Invite User
        </Link>
      </div>
    </div>
  );
}

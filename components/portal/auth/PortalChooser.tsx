import Link from "next/link";
import type { PortalRole } from "@/lib/auth/types";

interface PortalChooserProps {
  role: PortalRole;
  projectId: string;
  userName: string;
}

export default function PortalChooser({
  role,
  projectId,
  userName,
}: PortalChooserProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-6">
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-light text-white">
          Welcome, {userName}
        </h1>
        <p className="mt-2 text-[15px] text-[#86868B]">
          Choose which portal to access
        </p>
      </div>
      <div className="grid w-full max-w-[640px] gap-4 sm:grid-cols-2">
        <Link
          href={`/portal/team/${projectId}`}
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04]"
        >
          <div className="mb-3 text-[24px]">▧</div>
          <h2 className="text-[17px] font-medium text-white">Team Portal</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
            Manage tasks, milestones, documents, and LP visibility.
          </p>
        </Link>
        <Link
          href={`/portal/lp/${projectId}`}
          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04]"
        >
          <div className="mb-3 text-[24px]">◫</div>
          <h2 className="text-[17px] font-medium text-white">
            Investor Portal
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
            View the portal as your LPs see it.
          </p>
        </Link>
        {role === "admin" && (
          <Link
            href="/portal/admin"
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-champagne/30 hover:bg-white/[0.04] sm:col-span-2"
          >
            <div className="mb-3 text-[24px]">⚙</div>
            <h2 className="text-[17px] font-medium text-white">Admin Panel</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#86868B]">
              Manage users, invitations, and portal settings.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

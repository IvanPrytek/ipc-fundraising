import { listProjects } from "@/lib/auth/actions";
import InviteForm from "@/components/portal/admin/InviteForm";
import Link from "next/link";

export default async function InviteUserPage() {
  const { projects } = await listProjects();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/portal/admin/users"
          className="text-[12px] text-[#86868B] hover:text-white/70"
        >
          ← Back to Users
        </Link>
        <h1 className="mt-3 text-xl font-medium text-white">Invite User</h1>
        <p className="mt-1 text-[13px] text-[#86868B]">
          Send an invitation to join the portal. They will receive an email to
          set their password.
        </p>
      </div>
      <InviteForm projects={projects} />
    </div>
  );
}

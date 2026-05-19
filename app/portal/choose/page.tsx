import { requireRole } from "@/lib/auth/session";
import PortalChooser from "@/components/portal/auth/PortalChooser";

export default async function ChoosePage() {
  const user = await requireRole("admin", "team");

  if (!user.project_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <h1 className="text-[28px] font-light text-white">
            No Project Assigned
          </h1>
          <p className="mt-2 text-[15px] text-[#86868B]">
            Contact an administrator to be assigned to a project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortalChooser
      role={user.role}
      projectId={user.project_id}
      userName={user.full_name.split(" ")[0]}
    />
  );
}

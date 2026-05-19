import { requireRole } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";
import { redirect } from "next/navigation";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireRole("admin", "team");
  const { projectId } = await params;

  // Verify user has access to this project
  if (user.project_id !== projectId && user.role !== "admin") {
    redirect("/portal/choose");
  }

  const supabase = await createServerSupabase();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name ?? "Portal";

  return (
    <PortalShell portalType="team" projectId={projectId} projectName={projectName}>
      {children}
    </PortalShell>
  );
}

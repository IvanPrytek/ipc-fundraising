import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import PortalShell from "@/components/portal/PortalShell";

export default async function LPTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServerSupabase();

  const { data: link } = await supabase
    .from("portal_links")
    .select("*, projects(*)")
    .eq("token", token)
    .eq("type", "lp")
    .eq("is_active", true)
    .single();

  if (!link || (link.expires_at && new Date(link.expires_at) < new Date())) {
    redirect("/portal/invalid");
  }

  const projectName = link.projects?.name ?? "Portal";

  return (
    <PortalShell portalType="lp" token={token} projectName={projectName}>
      {children}
    </PortalShell>
  );
}

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PortalUser, PortalRole } from "./types";

/**
 * Get the current Supabase auth session.
 * Returns null if not authenticated — does NOT redirect.
 */
export const getSession = cache(async () => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Get the current portal user (auth user + portal_users row).
 * Returns null if not authenticated or no portal_users row exists.
 */
export const getPortalUser = cache(async (): Promise<PortalUser | null> => {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("portal_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  return data as PortalUser | null;
});

/**
 * Require authentication. Redirects to /portal/login if not authenticated.
 * Returns the portal user.
 */
export async function requireAuth(): Promise<PortalUser> {
  const portalUser = await getPortalUser();
  if (!portalUser) {
    redirect("/portal/login");
  }
  return portalUser;
}

/**
 * Require a specific role. Redirects if user doesn't have it.
 */
export async function requireRole(
  ...allowedRoles: PortalRole[]
): Promise<PortalUser> {
  const portalUser = await requireAuth();
  if (!allowedRoles.includes(portalUser.role)) {
    // Redirect based on what they CAN access
    if (portalUser.role === "lp" && portalUser.project_id) {
      redirect(`/portal/lp/${portalUser.project_id}`);
    }
    redirect("/portal/choose");
  }
  return portalUser;
}

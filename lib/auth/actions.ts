"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPortalUser } from "./session";
import type { PortalRole } from "./types";

// --- Login ---

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Look up the user's role to determine redirect destination
  const { data: portalUser } = await supabase
    .from("portal_users")
    .select("role, project_id")
    .eq("email", email)
    .eq("is_active", true)
    .single();

  if (!portalUser) {
    // Auth user exists but no portal_users row — sign them out
    await supabase.auth.signOut();
    return { error: "Your account is not active. Contact an administrator." };
  }

  // Update last_login_at
  await supabase
    .from("portal_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("email", email);

  // Redirect based on role
  if (portalUser.role === "lp" && portalUser.project_id) {
    redirect(`/portal/lp/${portalUser.project_id}`);
  }
  redirect("/portal/choose");
}

// --- Logout ---

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/portal/login");
}

// --- Set password (from invite link) ---

export async function setPassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Failed to set password. The link may have expired." };
  }

  redirect("/portal/login?message=Password+set+successfully.+Please+log+in.");
}

// --- Invite user (admin only) ---

export async function inviteUser(prevState: any, formData: FormData) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as PortalRole;
  const projectId = formData.get("projectId") as string;

  if (!email || !fullName || !role || !projectId) {
    return { error: "All fields are required." };
  }

  if (!["admin", "team", "lp"].includes(role)) {
    return { error: "Invalid role." };
  }

  // Check for duplicate email
  const { data: existing } = await supabaseAdmin
    .from("portal_users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "A user with this email already exists." };
  }

  // Create auth user and send invite email
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/login/set-password`,
    });

  if (authError || !authUser.user) {
    return { error: "Failed to send invitation. Please try again." };
  }

  // Insert portal_users row
  const { error: insertError } = await supabaseAdmin
    .from("portal_users")
    .insert({
      id: authUser.user.id,
      email,
      full_name: fullName,
      role,
      project_id: projectId,
      invited_by: currentUser.id,
    });

  if (insertError) {
    // Clean up the auth user if portal_users insert fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return { error: "Failed to create user record." };
  }

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Deactivate user (admin only) ---

export async function deactivateUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot deactivate yourself." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: "Failed to deactivate user." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Reactivate user (admin only) ---

export async function reactivateUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) return { error: "Failed to reactivate user." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Change role (admin only) ---

export async function changeUserRole(userId: string, newRole: PortalRole) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot change your own role." };
  }

  if (!["admin", "team", "lp"].includes(newRole)) {
    return { error: "Invalid role." };
  }

  const { error } = await supabaseAdmin
    .from("portal_users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { error: "Failed to update role." };

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- Delete user (admin only) ---

export async function deleteUser(userId: string) {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized." };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot delete yourself." };
  }

  // Delete from portal_users first (cascade will handle auth.users)
  const { error: portalError } = await supabaseAdmin
    .from("portal_users")
    .delete()
    .eq("id", userId);

  if (portalError) return { error: "Failed to delete user." };

  // Also remove from auth.users
  await supabaseAdmin.auth.admin.deleteUser(userId);

  revalidatePath("/portal/admin/users");
  return { success: true };
}

// --- List all users (admin only) ---

export async function listUsers() {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized.", users: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("portal_users")
    .select("*, projects(name)")
    .order("created_at", { ascending: false });

  if (error) return { error: "Failed to load users.", users: [] };
  return { users: data ?? [] };
}

// --- List projects (for invite form dropdown) ---

export async function listProjects() {
  const currentUser = await getPortalUser();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Unauthorized.", projects: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, name")
    .order("name");

  if (error) return { error: "Failed to load projects.", projects: [] };
  return { projects: data ?? [] };
}

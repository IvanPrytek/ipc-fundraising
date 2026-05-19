export type PortalRole = "admin" | "team" | "lp";

export interface PortalUser {
  id: string;
  email: string;
  full_name: string;
  role: PortalRole;
  project_id: string | null;
  is_active: boolean;
  invited_by: string | null;
  created_at: string;
  last_login_at: string | null;
}

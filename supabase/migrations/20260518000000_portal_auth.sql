-- =============================================================
-- Portal Auth Migration: portal_users table + RLS on all tables
-- =============================================================

-- 1. Create portal_users table
CREATE TABLE IF NOT EXISTS portal_users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'team', 'lp')),
  project_id  uuid REFERENCES projects(id),
  is_active   boolean NOT NULL DEFAULT true,
  invited_by  uuid REFERENCES portal_users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_role ON portal_users(role);
CREATE INDEX IF NOT EXISTS idx_portal_users_project ON portal_users(project_id);

-- 2. Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_portal_user_role()
RETURNS text AS $$
  SELECT role FROM public.portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_portal_user_project()
RETURNS uuid AS $$
  SELECT project_id FROM public.portal_users
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Enable RLS on all tables
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- 4. portal_users policies
CREATE POLICY "admin_read_all_users" ON portal_users
  FOR SELECT USING (get_portal_user_role() = 'admin');

CREATE POLICY "user_read_own" ON portal_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_insert_users" ON portal_users
  FOR INSERT WITH CHECK (get_portal_user_role() = 'admin');

CREATE POLICY "admin_update_users" ON portal_users
  FOR UPDATE USING (get_portal_user_role() = 'admin');

CREATE POLICY "admin_delete_users" ON portal_users
  FOR DELETE USING (get_portal_user_role() = 'admin');

-- 5. projects policies
CREATE POLICY "user_read_own_project" ON projects
  FOR SELECT USING (id = get_portal_user_project());

CREATE POLICY "admin_manage_projects" ON projects
  FOR ALL USING (get_portal_user_role() = 'admin');

-- 6. gantt_tasks policies
CREATE POLICY "team_admin_read_tasks" ON gantt_tasks
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_tasks" ON gantt_tasks
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_tasks" ON gantt_tasks
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 7. milestones policies
CREATE POLICY "team_admin_read_milestones" ON milestones
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_milestones" ON milestones
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_milestones" ON milestones
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 8. status_updates policies
CREATE POLICY "team_admin_read_updates" ON status_updates
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_updates" ON status_updates
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_updates" ON status_updates
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 9. fund_metrics policies
CREATE POLICY "user_read_metrics" ON fund_metrics
  FOR SELECT USING (project_id = get_portal_user_project());

CREATE POLICY "team_admin_write_metrics" ON fund_metrics
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 10. document_folders policies
CREATE POLICY "team_admin_read_folders" ON document_folders
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_folders" ON document_folders
  FOR SELECT USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() = 'lp'
    AND lp_visible = true
  );

CREATE POLICY "team_admin_write_folders" ON document_folders
  FOR ALL USING (
    project_id = get_portal_user_project()
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 11. documents policies (join through folder)
CREATE POLICY "team_admin_read_docs" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_docs" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
      AND df.lp_visible = true
    )
    AND get_portal_user_role() = 'lp'
  );

CREATE POLICY "team_admin_write_docs" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM document_folders df
      WHERE df.id = documents.folder_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 12. document_versions policies
CREATE POLICY "team_admin_read_versions" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

CREATE POLICY "lp_read_visible_versions" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
      AND df.lp_visible = true
    )
    AND get_portal_user_role() = 'lp'
  );

CREATE POLICY "team_admin_write_versions" ON document_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN document_folders df ON df.id = d.folder_id
      WHERE d.id = document_versions.document_id
      AND df.project_id = get_portal_user_project()
    )
    AND get_portal_user_role() IN ('admin', 'team')
  );

-- 13. Revoke direct anon access (belt-and-suspenders)
REVOKE ALL ON portal_users FROM anon;
REVOKE ALL ON gantt_tasks FROM anon;
REVOKE ALL ON milestones FROM anon;
REVOKE ALL ON status_updates FROM anon;
REVOKE ALL ON fund_metrics FROM anon;
REVOKE ALL ON document_folders FROM anon;
REVOKE ALL ON documents FROM anon;
REVOKE ALL ON document_versions FROM anon;

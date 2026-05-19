import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log(`Creating admin user: ${ADMIN_EMAIL}`);

  // 1. Create auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

  if (authError) {
    console.error("Failed to create auth user:", authError.message);
    process.exit(1);
  }

  console.log(`Auth user created: ${authUser.user.id}`);

  // 2. Insert portal_users row
  const { error: portalError } = await supabase.from("portal_users").insert({
    id: authUser.user.id,
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    role: "admin",
    project_id: null,
  });

  if (portalError) {
    console.error("Failed to create portal user:", portalError.message);
    // Clean up auth user
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log("Admin user created successfully.");
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Role: admin`);
  console.log("You can now log in at /portal/login");
}

main();

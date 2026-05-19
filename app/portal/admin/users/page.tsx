import { listUsers } from "@/lib/auth/actions";
import UserTable from "@/components/portal/admin/UserTable";
import Link from "next/link";

export default async function AdminUsersPage() {
  const { users } = await listUsers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-white">Users</h1>
          <p className="mt-1 text-[13px] text-[#86868B]">
            Manage portal access and roles.
          </p>
        </div>
        <Link
          href="/portal/admin/users/invite"
          className="rounded-lg bg-champagne px-4 py-2 text-[13px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light"
        >
          Invite User
        </Link>
      </div>
      <UserTable users={users as any} />
    </div>
  );
}

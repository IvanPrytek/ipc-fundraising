"use client";

import { useState } from "react";
import { deactivateUser, reactivateUser, deleteUser, changeUserRole } from "@/lib/auth/actions";
import type { PortalRole } from "@/lib/auth/types";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: PortalRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  invited_by: string | null;
  projects?: { name: string } | null;
}

export default function UserTable({ users }: { users: UserRow[] }) {
  const [actionState, setActionState] = useState<Record<string, string>>({});

  async function handleDeactivate(userId: string) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await deactivateUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleReactivate(userId: string) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await reactivateUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await deleteUser(userId);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  async function handleRoleChange(userId: string, newRole: PortalRole) {
    setActionState((s) => ({ ...s, [userId]: "loading" }));
    const result = await changeUserRole(userId, newRole);
    if (result?.error) {
      setActionState((s) => ({ ...s, [userId]: result.error! }));
    } else {
      setActionState((s) => ({ ...s, [userId]: "" }));
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-[2px] text-[#86868B]">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Role</th>
            <th className="pb-3 pr-4">Project</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Last Login</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
            >
              <td className="py-3 pr-4 text-white">{user.full_name}</td>
              <td className="py-3 pr-4 text-[#86868B]">{user.email}</td>
              <td className="py-3 pr-4">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as PortalRole)
                  }
                  className="rounded bg-white/[0.04] px-2 py-1 text-[12px] text-[#e5e5e5] outline-none border border-white/10"
                >
                  <option value="admin">Admin</option>
                  <option value="team">Team</option>
                  <option value="lp">LP</option>
                </select>
              </td>
              <td className="py-3 pr-4 text-[#86868B]">
                {user.projects?.name ?? "—"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3 pr-4 text-[11px] text-[#86868B]">
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Never"}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  {user.is_active ? (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      disabled={actionState[user.id] === "loading"}
                      className="text-[11px] text-amber-400 hover:text-amber-300 disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      disabled={actionState[user.id] === "loading"}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={actionState[user.id] === "loading"}
                    className="text-[11px] text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                {actionState[user.id] &&
                  actionState[user.id] !== "loading" && (
                    <div className="mt-1 text-[10px] text-red-400">
                      {actionState[user.id]}
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-[13px] text-[#86868B]">
          No users yet. Invite your first user to get started.
        </div>
      )}
    </div>
  );
}

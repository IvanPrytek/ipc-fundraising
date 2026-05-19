"use client";

import { useActionState } from "react";
import { inviteUser } from "@/lib/auth/actions";

interface InviteFormProps {
  projects: { id: string; name: string }[];
}

export default function InviteForm({ projects }: InviteFormProps) {
  const [state, formAction, pending] = useActionState(inviteUser, null);

  return (
    <form action={formAction} className="max-w-[480px] space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          Invitation sent successfully.
        </div>
      )}
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="John Smith"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="john@company.com"
        />
      </div>
      <div>
        <label
          htmlFor="role"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none focus:border-champagne/40 transition-colors"
        >
          <option value="">Select a role...</option>
          <option value="team">Team Member</option>
          <option value="lp">LP / Investor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="projectId"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none focus:border-champagne/40 transition-colors"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending invitation..." : "Send Invitation"}
      </button>
    </form>
  );
}

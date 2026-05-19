"use client";

import { useActionState } from "react";
import { setPassword } from "@/lib/auth/actions";

export default function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPassword, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Minimum 8 characters"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Confirm your password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Setting password..." : "Set Password"}
      </button>
    </form>
  );
}

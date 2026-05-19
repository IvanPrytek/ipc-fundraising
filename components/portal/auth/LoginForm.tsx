"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth/actions";

export default function LoginForm({ message }: { message?: string }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-5">
      {message && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-400">
          {message}
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {state.error}
        </div>
      )}
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
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[2px] text-[#86868B]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white outline-none placeholder:text-[#86868B]/50 focus:border-champagne/40 transition-colors"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-champagne py-3 text-[14px] font-medium text-[#1A1A1A] transition-colors hover:bg-champagne-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

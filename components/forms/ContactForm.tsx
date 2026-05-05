"use client";

import { useState } from "react";
import { ContactRole } from "@/lib/types";

const ROLES: { value: ContactRole; label: string; note: string }[] = [
  {
    value: "business-owner",
    label: "Business owner",
    note: "Exploring succession or exit",
  },
  {
    value: "management-team",
    label: "Management team",
    note: "Looking to buy the business you run",
  },
  {
    value: "advisor",
    label: "Advisor or intermediary",
    note: "Referring a client or exploring partnership",
  },
];

export default function ContactForm() {
  const [role, setRole] = useState<ContactRole | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="py-16">
        <h3 className="text-2xl font-light text-white">Thank you.</h3>
        <p className="mt-4 text-[15px] text-white/50">
          We&apos;ll be in touch within one business day.
        </p>
      </div>
    );
  }

  return (
    <div>
      {!role ? (
        <div className="space-y-3">
          <p className="mb-6 text-sm text-white/40">I am a...</p>
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className="block w-full border-b border-white/[0.06] py-5 text-left transition-all duration-500 hover:pl-2"
            >
              <span className="text-[17px] text-white/80">{r.label}</span>
              <span className="ml-3 text-sm text-white/30">{r.note}</span>
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-8"
        >
          <button
            type="button"
            onClick={() => setRole(null)}
            className="text-sm text-white/35 transition-colors duration-500 hover:text-white/70"
          >
            ← Back
          </button>

          <div>
            <label className="block text-sm text-white/50">Name</label>
            <input
              type="text"
              required
              className="mt-2 w-full border-b border-white/10 bg-transparent py-3 text-[17px] text-white outline-none transition-colors duration-500 placeholder:text-white/20 focus:border-champagne/40"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50">Email</label>
            <input
              type="email"
              required
              className="mt-2 w-full border-b border-white/10 bg-transparent py-3 text-[17px] text-white outline-none transition-colors duration-500 placeholder:text-white/20 focus:border-champagne/40"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50">
              Phone <span className="text-white/20">optional</span>
            </label>
            <input
              type="tel"
              className="mt-2 w-full border-b border-white/10 bg-transparent py-3 text-[17px] text-white outline-none transition-colors duration-500 placeholder:text-white/20 focus:border-champagne/40"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50">Message</label>
            <textarea
              rows={3}
              className="mt-2 w-full resize-none border-b border-white/10 bg-transparent py-3 text-[17px] text-white outline-none transition-colors duration-500 placeholder:text-white/20 focus:border-champagne/40"
              placeholder="Tell us about your situation..."
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-white px-8 py-3.5 text-[15px] tracking-wide text-[#0A0A0A] transition-all duration-500 hover:bg-champagne"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

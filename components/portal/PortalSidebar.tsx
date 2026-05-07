"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PortalType } from "@/lib/portal/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface PortalSidebarProps {
  portalType: PortalType;
  token: string;
  projectName: string;
}

const TEAM_NAV: NavItem[] = [
  { label: "Dashboard", href: "", icon: "◫" },
  { label: "Gantt Chart", href: "/gantt", icon: "▧" },
  { label: "Milestones", href: "/milestones", icon: "◈" },
  { label: "Status Updates", href: "/updates", icon: "◱" },
  { label: "Documents", href: "/documents", icon: "◰" },
];

const TEAM_NAV_BOTTOM: NavItem[] = [
  { label: "LP Visibility", href: "/visibility", icon: "◉" },
];

const LP_NAV: NavItem[] = [
  { label: "Overview", href: "", icon: "◫" },
  { label: "Milestones", href: "/milestones", icon: "◈" },
  { label: "Documents", href: "/documents", icon: "◰" },
];

export default function PortalSidebar({
  portalType,
  token,
  projectName,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = `/portal/${portalType}/${token}`;
  const navItems = portalType === "team" ? TEAM_NAV : LP_NAV;
  const bottomItems = portalType === "team" ? TEAM_NAV_BOTTOM : [];

  const isActive = (itemHref: string) => {
    const fullPath = basePath + itemHref;
    if (itemHref === "") {
      return pathname === basePath || pathname === basePath + "/";
    }
    return pathname.startsWith(fullPath);
  };

  const portalLabel =
    portalType === "team"
      ? `${projectName} — Deal Team`
      : `${projectName} — Investor Portal`;

  return (
    <>
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0F0F0F] px-4 py-3 md:hidden">
        <div>
          <div className="text-[15px] font-semibold text-white">
            Ownera Capital
          </div>
          <div className="text-[11px] text-[#86868B]">{portalLabel}</div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/70"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-[200px] flex-col border-r border-white/[0.06] bg-[#0F0F0F]",
          "transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="border-b border-white/[0.06] px-4 pb-5 pt-5">
          <div className="text-[15px] font-semibold text-white">
            Ownera Capital
          </div>
          <div className="mt-0.5 text-[11px] text-[#86868B]">
            {portalLabel}
          </div>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={basePath + item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-200",
                isActive(item.href)
                  ? "border-l-2 border-champagne bg-white/5 pl-[14px] text-white"
                  : "text-[#86868B] hover:text-white/70"
              )}
            >
              <span className="w-4 text-center text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {bottomItems.length > 0 && (
            <>
              <div className="mx-4 my-2 h-px bg-white/[0.06]" />
              {bottomItems.map((item) => (
                <Link
                  key={item.href}
                  href={basePath + item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-200",
                    isActive(item.href)
                      ? "border-l-2 border-champagne bg-white/5 pl-[14px] text-white"
                      : "text-[#86868B] hover:text-white/70"
                  )}
                >
                  <span className="w-4 text-center text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

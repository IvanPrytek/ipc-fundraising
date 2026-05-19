"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/admin", icon: "◫" },
  { label: "Users", href: "/portal/admin/users", icon: "◱" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/portal/admin") {
      return pathname === "/portal/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-[200px] flex-col border-r border-white/[0.06] bg-[#0F0F0F] md:flex">
      <div className="border-b border-white/[0.06] px-4 pb-5 pt-5">
        <div className="text-[15px] font-semibold text-white">
          Ownera Capital
        </div>
        <div className="mt-0.5 text-[11px] text-[#86868B]">
          Admin Panel
        </div>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <Link
          href="/portal/choose"
          className="text-[12px] text-[#86868B] hover:text-white/70"
        >
          ← Back to Portal
        </Link>
      </div>
    </aside>
  );
}

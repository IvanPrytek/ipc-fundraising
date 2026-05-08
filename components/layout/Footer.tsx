import Link from "next/link";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div>
            <span className="text-white/70"><Logo height={28} /></span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/25">
              The trusted PE partner for management-led ownership transitions.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative z-10 text-sm text-white/30 transition-colors duration-500 hover:text-white/70"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 text-xs text-white/15">
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}

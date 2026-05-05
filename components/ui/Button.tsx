import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light" | "outline";
  className?: string;
}

export default function Button({
  href,
  children,
  variant = "dark",
  className = "",
}: ButtonProps) {
  const base =
    "inline-block px-8 py-3.5 text-[15px] tracking-wide transition-all duration-500 ease-out";
  const variants = {
    dark: "bg-primary text-white hover:bg-black",
    light: "bg-white text-[#0A0A0A] hover:bg-champagne",
    outline: "border border-white/15 text-white/70 hover:border-white/40 hover:text-white",
  };

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

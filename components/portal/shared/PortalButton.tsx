import { cn } from "@/lib/utils";

interface PortalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "accent" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function PortalButton({
  children,
  onClick,
  variant = "outline",
  className,
  type = "button",
  disabled = false,
}: PortalButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-3.5 py-1.5 text-[12px] transition-all duration-200",
        variant === "accent"
          ? "bg-champagne font-medium text-[#1A1A1A] hover:bg-champagne-light"
          : "border border-white/15 text-[#e5e5e5] hover:border-white/30",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

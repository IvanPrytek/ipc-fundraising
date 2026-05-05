"use client";

type GlowPosition = "top-left" | "top-center" | "top-right" | "center" | "bottom-center";

const GLOW_CLASSES: Record<GlowPosition, string> = {
  "top-left": "left-[10%] top-[10%]",
  "top-center": "left-[40%] top-[5%]",
  "top-right": "right-[10%] top-[10%]",
  center: "left-[30%] top-[30%]",
  "bottom-center": "left-[40%] bottom-[10%]",
};

export default function PageBackground({
  children,
  glow = "top-center",
}: {
  children: React.ReactNode;
  glow?: GlowPosition;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] pt-24">
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute h-[500px] w-[500px] animate-[drift1_20s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(196,176,137,0.07)_0%,transparent_70%)] blur-[80px] ${GLOW_CLASSES[glow]}`}
        />
        <div className="absolute right-[15%] top-[50%] h-[400px] w-[400px] animate-[drift2_25s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(196,176,137,0.05)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[500px] w-[500px] animate-[drift3_30s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(140,120,90,0.04)_0%,transparent_70%)] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

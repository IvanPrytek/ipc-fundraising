"use client";

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[#0A0A0A]">
      {/* Animated gradient blobs — inspired by bg.ibelick/gradient-background-4 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-[500px] w-[500px] animate-[drift1_20s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(196,176,137,0.08)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute right-[15%] top-[40%] h-[400px] w-[400px] animate-[drift2_25s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(196,176,137,0.06)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[20%] left-[30%] h-[600px] w-[600px] animate-[drift3_30s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(140,120,90,0.05)_0%,transparent_70%)] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

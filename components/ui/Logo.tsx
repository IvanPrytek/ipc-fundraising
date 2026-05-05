export default function Logo({ className = "", height = 24 }: { className?: string; height?: number }) {
  // Aspect ratio tuned to fit "OWNERA CAPITAL" at proper letter-spacing
  const width = Math.round(height * 10.5);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 252 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ownera Capital"
    >
      <text
        x="0"
        y="18"
        fill="currentColor"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "20px",
          fontWeight: 600,
          letterSpacing: "0.2em",
        }}
      >
        OWNERA
      </text>
      <text
        x="130"
        y="18"
        fill="currentColor"
        opacity="0.45"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "20px",
          fontWeight: 300,
          letterSpacing: "0.2em",
        }}
      >
        CAPITAL
      </text>
    </svg>
  );
}

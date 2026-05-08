export default function Logo({ className = "", height = 24 }: { className?: string; height?: number }) {
  const scale = height / 32;
  const width = Math.round(280 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ownera Capital"
    >
      {/* Icon — two overlapping squares: ownership transfer */}
      <g transform="translate(2, 4)">
        <rect x="0" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="6" y="0" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
      </g>

      {/* OWNERA — bold */}
      <text
        x="34"
        y="21"
        fill="currentColor"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        OWNERA
      </text>

      {/* CAPITAL — light */}
      <text
        x="150"
        y="21"
        fill="currentColor"
        opacity="0.4"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "18px",
          fontWeight: 300,
          letterSpacing: "0.14em",
        }}
      >
        CAPITAL
      </text>
    </svg>
  );
}

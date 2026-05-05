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
      {/* Icon — stylized "O" with upward arrow, representing ownership transition */}
      <g transform="translate(0, 2)">
        {/* Outer ring */}
        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
        {/* Arrow cutting through — upward momentum */}
        <path
          d="M14 22 L14 6 M10 10 L14 5 L18 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* OWNERA — bold */}
      <text
        x="38"
        y="20"
        fill="currentColor"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "19px",
          fontWeight: 700,
          letterSpacing: "0.15em",
        }}
      >
        OWNERA
      </text>

      {/* CAPITAL — lighter weight */}
      <text
        x="160"
        y="20"
        fill="currentColor"
        opacity="0.5"
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "19px",
          fontWeight: 300,
          letterSpacing: "0.15em",
        }}
      >
        CAPITAL
      </text>
    </svg>
  );
}

export default function Logo({ className = "", height = 24 }: { className?: string; height?: number }) {
  const scale = height / 32;
  const width = Math.round(300 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ownera Capital"
    >
      {/* Prytek three-square icon — exact 2018 geometry, scaled to fit */}
      <g transform="translate(0, 1) scale(0.44)">
        <path
          d="M42.2,17V0H0v42.3h16.9v25.5h50.7V17H42.2z M8.4,33.9V8.5h25.3V17H16.8v16.9H8.4z M33.7,25.4v8.4h-8.4v-8.4H33.7z M59.1,59.3H25.3v-17h16.9V25.4h16.9V59.3z"
          fill="currentColor"
        />
      </g>

      {/* OWNERA — Stolzl Medium */}
      <text
        x="38"
        y="21"
        fill="currentColor"
        style={{
          fontFamily: "'Stolzl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "17px",
          fontWeight: 500,
          letterSpacing: "0.18em",
        }}
      >
        OWNERA
      </text>

      {/* CAPITAL — Stolzl Light */}
      <text
        x="155"
        y="21"
        fill="currentColor"
        opacity="0.45"
        style={{
          fontFamily: "'Stolzl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "17px",
          fontWeight: 300,
          letterSpacing: "0.18em",
        }}
      >
        CAPITAL
      </text>
    </svg>
  );
}

export default function Logo({ className = "", height = 24 }: { className?: string; height?: number }) {
  const iconSize = height;
  const fontSize = height * 0.7;

  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label="Ownera Capital"
      style={{ height }}
    >
      {/* Prytek 2018 three-square icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M42.2,17V0H0v42.3h16.9v25.5h50.7V17H42.2z M8.4,33.9V8.5h25.3V17H16.8v16.9H8.4z M33.7,25.4v8.4h-8.4v-8.4H33.7z M59.1,59.3H25.3v-17h16.9V25.4h16.9V59.3z"
          fill="currentColor"
        />
      </svg>

      {/* OWNERA CAPITAL — Stolzl font */}
      <span
        style={{
          fontFamily: "'Stolzl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: `${fontSize}px`,
          letterSpacing: "0.16em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontWeight: 500 }}>OWNERA</span>
        <span style={{ fontWeight: 300, opacity: 0.45, marginLeft: "0.3em" }}>
          CAPITAL
        </span>
      </span>
    </div>
  );
}

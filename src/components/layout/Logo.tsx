import { Link } from "@tanstack/react-router";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <div
        className="relative grid place-items-center rounded-xl"
        style={{
          width: size + 8,
          height: size + 8,
          background: "var(--gradient-primary)",
          boxShadow: "0 0 20px oklch(0.65 0.18 250 / 0.5)",
        }}
      >
        <svg width={size - 6} height={size - 6} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 5 3 12 8 19" />
          <polyline points="16 5 21 12 16 19" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Codi<span className="text-gradient">arc</span>
      </span>
    </Link>
  );
}

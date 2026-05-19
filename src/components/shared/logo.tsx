import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogoProps {
  /** Icon size in px — wordmark scales proportionally */
  size?: number;
  /** Show "IsoTrack" wordmark next to the mark */
  showWordmark?: boolean;
  /** Wrap the whole logo in a Next.js Link */
  href?: string;
  className?: string;
}

// ─── Brand mark ───────────────────────────────────────────────────────────────
//
//  Concept: "The Trace"
//  A rounded square with a violet→sky gradient holds three diagonal waypoint
//  dots (origin · transit · destination) connected by a soft route line.
//  Reads as a shipment route at a glance and stays crisp at 14 px.
//
function IsoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Diagonal gradient: deep violet (bottom-left) → sky (top-right) */}
        <linearGradient id="iso-bg-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Subtle radial shine on the dots */}
        <radialGradient id="iso-dot-g" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      {/* ── Background: rounded square ── */}
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#iso-bg-g)" />

      {/* Subtle inner highlight edge — top-left catch-light */}
      <rect
        x="1" y="1" width="22" height="22" rx="6.5"
        stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" fill="none"
      />

      {/* ── Route line connecting the three waypoints ── */}
      <path
        d="M7.5 16.5 Q12 12 16.5 7.5"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Origin dot (bottom-left) ── */}
      <circle cx="7.5" cy="16.5" r="2.4" fill="url(#iso-dot-g)" />

      {/* ── Transit dot (center) — slightly smaller, more transparent ── */}
      <circle cx="12" cy="12" r="1.55" fill="rgba(255,255,255,0.52)" />

      {/* ── Destination dot (top-right) ── */}
      <circle cx="16.5" cy="7.5" r="2.4" fill="url(#iso-dot-g)" />
    </svg>
  );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function IsoWordmark({ size }: { size: number }) {
  const fontSize = Math.round(size * 0.46);

  return (
    <span
      className="font-bold tracking-tight leading-none select-none"
      style={{ fontSize }}
    >
      <span className="text-white">Iso</span>
      <span
        style={{
          background: "linear-gradient(90deg, #a78bfa 0%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Track
      </span>
    </span>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({
  size = 32,
  showWordmark = true,
  href,
  className,
}: LogoProps) {
  const inner = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <IsoMark size={size} />
      {showWordmark && <IsoWordmark size={size} />}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {inner}
      </Link>
    );
  }

  return inner;
}

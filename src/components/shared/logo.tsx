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

// ─── Mark ────
function IsoMark({ size }: { size: number }) {
  const innerSize = Math.round(size * 0.58); // pin SVG is 58 % of the square

  return (
    <div>
      <svg
        width={innerSize}
        height={innerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pin body — white teardrop */}
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" fill="white" />
        {/*
          Inner circle — semi-transparent dark overlay creates the "eye" of
          the pin and gives it depth without needing a second gradient.
        */}
        <circle cx="12" cy="10" r="3" fill="rgba(0,0,0,0.22)" />
      </svg>
    </div>
  );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function IsoWordmark({ size }: { size: number }) {
  // Font size scales with the icon: at size=32 → ~14px, size=28 → ~12px, etc.
  const fontSize = Math.round(size * 0.44);

  return (
    <span className="font-semibold tracking-tight leading-none select-none" style={{ fontSize }}>
      <span className="text-white">Iso</span>
      <span className="text-sky-400">Track</span>
    </span>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

export function Logo({ size = 32, showWordmark = true, href, className }: LogoProps) {
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

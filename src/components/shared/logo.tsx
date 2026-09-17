import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number | undefined;
  showWordmark?: boolean | undefined;
  tone?: "dark" | "light" | undefined;
  href?: Route | undefined;
  className?: string | undefined;
}

export function Logo({
  size = 32,
  showWordmark = true,
  tone = "light",
  href,
  className,
}: LogoProps) {
  const markSize = showWordmark ? Math.max(30, Math.round(size * 0.86)) : size;
  const textSize = Math.max(18, Math.round(markSize * 0.62));
  const ink = tone === "light" ? "text-stone-50" : "text-stone-950";
  const trackInk = tone === "light" ? "text-teal-100" : "text-teal-950";

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 align-middle",
        className,
      )}
    >
      <Image
        src="/images/isotrack-mark-trimmed.png"
        alt=""
        width={markSize}
        height={markSize}
        priority
        aria-hidden="true"
        className="shrink-0 object-contain"
        style={{ width: markSize, height: markSize }}
      />

      {showWordmark ? (
        <span
          className={cn(
            "select-none whitespace-nowrap font-black leading-none tracking-normal",
            ink,
          )}
          style={{ fontSize: textSize }}
        >
          Iso<span className={trackInk}>Track</span>
        </span>
      ) : (
        <span className="sr-only">IsoTrack</span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label="IsoTrack home">
        {inner}
      </Link>
    );
  }

  return inner;
}

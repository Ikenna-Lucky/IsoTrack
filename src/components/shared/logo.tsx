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
  const visualHeight = showWordmark ? Math.max(18, Math.round(size * 0.72)) : size;
  const width = showWordmark ? Math.round(visualHeight * 4) : visualHeight;
  const src = showWordmark ? "/images/isotrack-logo.svg" : "/favicon.svg";

  const inner = (
    <span
      className={cn(
        "inline-flex items-center",
        tone === "light" && showWordmark && "rounded-md bg-white px-1.5 py-0.5",
        className,
      )}
    >
      <Image
        src={src}
        alt="IsoTrack"
        width={width}
        height={visualHeight}
        priority
        className="object-contain"
        style={{ width, height: visualHeight }}
      />
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

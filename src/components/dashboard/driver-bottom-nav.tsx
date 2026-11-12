"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Menu } from "lucide-react";
import type { Route } from "next";
import { cn } from "@/lib/utils";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/driver", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/driver/deliveries", label: "Deliveries", icon: Package, exact: false },
  { href: "/driver/earnings", label: "Record", icon: ClipboardList, exact: false },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onMenuOpen: () => void;
}

export function DriverBottomNav({ onMenuOpen }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="border-t border-[var(--landing-border)] bg-[var(--landing-panel)] backdrop-blur-xl">
        <div className="flex items-stretch h-16">
          {/* Main nav links */}
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-150",
                  active
                    ? "text-[var(--landing-accent)]"
                    : "text-[var(--landing-muted)] active:text-[var(--landing-muted)]",
                )}
              >
                {/* Top accent bar */}
                {active && (
                  <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-300" />
                )}

                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-150",
                    active && "scale-110",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold tracking-wide",
                    active ? "text-[var(--landing-accent)]" : "text-[var(--landing-muted)]",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="flex items-center py-3">
            <span className="h-full w-px bg-[var(--landing-tint)]" />
          </div>

          {/* More — opens sidebar drawer */}
          <button
            onClick={onMenuOpen}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[var(--landing-muted)] transition-all duration-150 active:text-[var(--landing-muted)]"
            aria-label="Open menu"
          >
            <Menu className="h-[22px] w-[22px]" />
            <span className="text-xs font-semibold tracking-wide">More</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

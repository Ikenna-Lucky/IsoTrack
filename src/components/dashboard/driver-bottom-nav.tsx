"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Menu,
} from "lucide-react";
import type { Route } from "next";
import { cn } from "@/lib/utils";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/driver",            label: "Overview",   icon: LayoutDashboard, exact: true  },
  { href: "/driver/deliveries", label: "Deliveries", icon: Package,         exact: false },
  { href: "/driver/earnings",   label: "Earnings",   icon: DollarSign,      exact: false },
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
      <div className="border-t border-white/[0.06] bg-[#09090c]/95 backdrop-blur-xl">
        <div className="flex items-stretch h-16">

          {/* Main nav links */}
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href as Route}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-150",
                  active ? "text-teal-400" : "text-zinc-600 active:text-zinc-300",
                )}
              >
                {/* Top accent bar */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
                )}

                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-150",
                    active && "scale-110",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide",
                    active ? "text-teal-400" : "text-zinc-600",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="flex items-center py-3">
            <span className="h-full w-px bg-white/[0.04]" />
          </div>

          {/* More — opens sidebar drawer */}
          <button
            onClick={onMenuOpen}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-zinc-600 active:text-zinc-300 transition-all duration-150"
            aria-label="Open menu"
          >
            <Menu className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-semibold tracking-wide">More</span>
          </button>

        </div>
      </div>
    </nav>
  );
}

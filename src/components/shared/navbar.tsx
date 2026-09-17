"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Menu, PackageSearch, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const NAV_LINKS: { label: string; href: Route }[] = [
  { label: "Features", href: "/#features" as Route },
  { label: "Workflow", href: "/#how-it-works" as Route },
  { label: "Dashboards", href: "/#roles" as Route },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <nav
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between rounded-md border border-stone-700/80 bg-[#0c0b08]/90 px-3 shadow-sm shadow-black/30 backdrop-blur-xl transition-shadow sm:px-4 lg:px-5",
            scrolled && "shadow-lg shadow-black/40",
          )}
        >
          <Logo href="/" size={45} tone="light" />

          <div className="hidden items-center rounded-md border border-stone-700 bg-stone-950/70 p-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-1.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              className="inline-flex items-center gap-2 rounded-md border border-stone-700 bg-stone-950 px-3.5 py-2 text-sm font-semibold text-stone-200 transition-colors hover:border-amber-500/50 hover:bg-stone-900"
            >
              <PackageSearch className="h-4 w-4 text-amber-400" />
              Track shipment
            </Link>
            <Link
              href={"/login" as Route}
              className="px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:text-stone-100"
            >
              Log in
            </Link>
            <Link
              href={"/register" as Route}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950 transition-colors hover:bg-amber-300"
            >
              Create shipment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-md border border-stone-700 bg-stone-950 p-2 text-stone-200 transition-colors hover:bg-stone-900 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#0c0b08]/[0.98] px-5 pt-24 backdrop-blur-xl transition-all duration-200 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="mx-auto max-w-sm">
          <div className="mb-5 rounded-md border border-stone-700 bg-stone-950 p-2">
            <Link
              href={"/track/IST-K7X2M9PQ" as Route}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded bg-stone-900 px-3 py-3 text-sm font-semibold text-stone-100 shadow-sm"
            >
              <PackageSearch className="h-4 w-4 text-amber-400" />
              Track sample shipment
            </Link>
          </div>

          <div className="overflow-hidden rounded-md border border-stone-700 bg-stone-950">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-stone-800 px-4 py-3 text-sm font-medium text-stone-300 last:border-b-0 hover:bg-stone-900 hover:text-stone-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            <Link
              href={"/register" as Route}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-amber-300"
            >
              Create shipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={"/login" as Route}
              onClick={() => setMobileOpen(false)}
              className="rounded-md border border-stone-700 bg-stone-950 px-5 py-3 text-center text-sm font-semibold text-stone-300 transition-colors hover:bg-stone-900"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

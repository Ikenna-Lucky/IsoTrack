"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const NAV_LINKS: { label: string; href: Route }[] = [
  { label: "Features", href: "/#features" as Route },
  { label: "How it Works", href: "/#how-it-works" as Route },
  { label: "Testimonials", href: "/#testimonials" as Route },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-white/[0.06] bg-black/80 backdrop-blur-xl py-4" : "py-5",
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Logo href="/" size={35} />

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={"/login" as Route}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href={"/register" as Route}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 transition-colors"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden rounded-md p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
        <div className="relative flex flex-col h-full pt-24 px-6 pb-10">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-lg font-medium text-zinc-300 hover:text-white transition-colors border-b border-white/[0.06]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={"/login" as Route}
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-lg border border-white/10 py-3 text-center text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href={"/register" as Route}
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-lg bg-sky-500 py-3 text-center text-sm font-medium text-white hover:bg-sky-400 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

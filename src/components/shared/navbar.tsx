"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, ScanLine, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const links = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For your customers", href: "#roles" },
] as const;

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080b0b]";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggle.current?.focus();
      }
    };
    const onOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target))
        setMobileOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1100px)");
    const onDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [mobileOpen]);

  function trackShipment(event: MouseEvent<HTMLAnchorElement>) {
    setMobileOpen(false);
    const form = document.getElementById("shipment-tracking");
    const input = form?.querySelector<HTMLInputElement>("input");
    if (!form || !input) return;
    event.preventDefault();
    form.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    input.focus({ preventScroll: true });
  }

  return (
    <header
      ref={header}
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-7 transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none min-[601px]:px-12 min-[951px]:px-[55px] min-[1151px]:px-[6vw]",
        scrolled || mobileOpen
          ? "bg-[#080b0b]/95 shadow-[0_8px_28px_#0003] backdrop-blur-xl"
          : "bg-[#080b0b]/80 backdrop-blur-md",
      )}
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto max-w-[1320px] border-b border-white/[0.08]"
      >
        <div className="flex h-[84px] items-center justify-between gap-6 max-[600px]:h-[76px]">
          <div className="shrink-0 [&_a]:rounded-sm [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-teal-300">
            <Logo href="/" size={40} tone="light" />
          </div>

          <div className="hidden items-center gap-7 min-[1100px]:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-sm py-3 text-[13px] font-medium text-stone-400 transition-colors hover:text-stone-50",
                  focus,
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-6 min-[1100px]:flex">
            <a
              href="#shipment-tracking"
              onClick={trackShipment}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-sm text-[12px] font-medium text-stone-300 transition-colors hover:text-teal-200",
                focus,
              )}
            >
              <ScanLine size={16} strokeWidth={1.6} aria-hidden="true" /> Track a shipment
            </a>
            <span className="h-4 w-px bg-white/15" aria-hidden="true" />
            <Link
              href="/login"
              className={cn(
                "inline-flex min-h-11 items-center rounded-sm text-[12px] font-medium text-stone-300 hover:text-white",
                focus,
              )}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(
                "inline-flex min-h-10 items-center gap-3 rounded bg-amber-400 px-4 text-[12px] font-semibold text-stone-950 transition-colors hover:bg-amber-300",
                focus,
              )}
            >
              Get started <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-5 min-[1100px]:hidden">
            <Link
              href="/login"
              className={cn(
                "hidden min-h-11 items-center rounded-sm text-xs font-medium text-stone-300 min-[480px]:inline-flex",
                focus,
              )}
            >
              Sign in
            </Link>
            <button
              ref={toggle}
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded border border-white/15 text-stone-200 transition-colors hover:bg-white/5",
                focus,
              )}
            >
              {mobileOpen ? (
                <X size={21} strokeWidth={1.6} aria-hidden="true" />
              ) : (
                <Menu size={21} strokeWidth={1.6} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            id={menuId}
            className="max-h-[calc(100dvh-100px)] overflow-y-auto border-t border-white/10 pb-7 pt-3 min-[1100px]:hidden"
          >
            <div className="divide-y divide-white/[0.06]">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-14 items-center justify-between rounded-sm py-3 text-sm font-medium text-stone-200 hover:text-teal-200",
                    focus,
                  )}
                >
                  {link.label}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.5}
                    className="text-stone-600"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
            <a
              href="#shipment-tracking"
              onClick={trackShipment}
              className={cn(
                "mt-4 flex min-h-12 items-center gap-3 rounded border border-white/15 px-4 text-sm font-medium text-stone-200 hover:border-teal-300/40",
                focus,
              )}
            >
              <ScanLine size={17} strokeWidth={1.6} aria-hidden="true" /> Track a shipment
            </a>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded border border-white/15 text-xs font-medium text-stone-200 hover:bg-white/5",
                  focus,
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded bg-amber-400 px-3 text-xs font-semibold text-stone-950 hover:bg-amber-300",
                  focus,
                )}
              >
                Get started <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

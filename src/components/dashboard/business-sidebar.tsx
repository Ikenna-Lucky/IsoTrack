"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Truck,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useBusinessProfile } from "@/hooks/use-business";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/business", label: "Overview", Icon: LayoutDashboard },
  { href: "/business/shipments", label: "Shipments", Icon: Package },
  { href: "/business/drivers", label: "Private fleet", Icon: Truck },
  { href: "/business/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/business/settings", label: "Settings", Icon: Settings },
  { href: "/business/help", label: "Help", Icon: HelpCircle },
] as const;

export function BusinessSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const { data: business } = useBusinessProfile();
  const logout = useAuthStore((s) => s.logout);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const modal = dialog.current;
    if (open && !modal?.open) modal?.showModal();
    if (!open && modal?.open) modal.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (desktop.matches) onClose();
    };
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", resize);
    };
  }, [open, onClose]);

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      setSigningOut(false);
    }
  }

  function content(mobile: boolean) {
    return (
      <>
        <div className="flex h-24 shrink-0 items-center justify-between px-6">
          <Logo href="/business" size={38} />
          {mobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="grid size-11 place-items-center rounded-md hover:bg-[var(--landing-tint)]"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="mx-5 mb-7 border-y border-[var(--landing-border)] py-4">
          <p className="text-xs text-[var(--landing-muted)]">Business workspace</p>
          <p className="mt-1 truncate text-sm font-semibold">
            {business?.businessName ?? "Your business"}
          </p>
        </div>
        <nav
          aria-label={mobile ? "Mobile business navigation" : "Business navigation"}
          className="space-y-1 px-3"
        >
          {navigation.map(({ href, label, Icon }, index) => {
            const active = href === "/business" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-md border-l-2 px-4 text-sm transition-colors",
                  index === 4 && "!mt-8",
                  active
                    ? "border-[var(--landing-accent)] bg-[var(--landing-selection)] font-semibold text-[var(--landing-accent)]"
                    : "border-transparent text-[var(--landing-muted)] hover:bg-[var(--landing-tint)] hover:text-[var(--landing-ink)]",
                )}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-6 pb-6 pt-10">
          <div className="mb-5 border-l border-[var(--landing-border)] pl-3 text-xs leading-5 text-[var(--landing-muted)]">
            Your drivers.
            <br />
            Your delivery operations.
          </div>
          <button
            type="button"
            onClick={() => void signOut().catch(() => {})}
            disabled={signingOut}
            className="flex min-h-11 w-full items-center gap-3 text-sm text-[var(--landing-muted)] hover:text-[var(--landing-ink)] disabled:opacity-50"
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-[var(--landing-border)] bg-[var(--landing-panel)] lg:flex">
        {content(false)}
      </aside>
      <dialog
        ref={dialog}
        aria-label="Business navigation"
        onCancel={onClose}
        onClose={onClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-[var(--landing-panel)] p-0 text-[var(--landing-ink)] backdrop:bg-black/60"
      >
        <div className="flex min-h-full flex-col">{content(true)}</div>
      </dialog>
    </>
  );
}

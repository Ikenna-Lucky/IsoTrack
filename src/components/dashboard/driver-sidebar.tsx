"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import type { Route } from "next";
import { Logo } from "@/components/shared/logo";
import { useDriverProfile } from "@/hooks/use-driver";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth";
import { FleetDialog } from "./fleet-dialog";
import { driverButton } from "./driver-workspace";

const links: { href: Route; label: string; Icon: typeof Package }[] = [
  { href: "/driver", label: "Overview", Icon: LayoutDashboard },
  { href: "/driver/deliveries", label: "Deliveries", Icon: Package },
  { href: "/driver/earnings", label: "Delivery record", Icon: ClipboardList },
  { href: "/driver/settings", label: "Settings", Icon: Settings },
  { href: "/driver/help", label: "Help", Icon: HelpCircle },
];
export function DriverSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
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
  const profile = useDriverProfile();
  const user = useAuthStore((state) => state.user);
  const [confirm, setConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      await api.post("/auth/logout");
      useAuthStore.getState().clearAuth();
    } catch (cause) {
      setSignOutError(extractErrorMessage(cause, "Sign-out could not be confirmed. Try again."));
    } finally {
      setSigningOut(false);
    }
  }
  function navigation(mobile: boolean) {
    return (
      <>
        <div className="flex h-24 shrink-0 items-center justify-between px-6">
          <Logo href="/driver" size={38} />
          {mobile && (
            <button
              type="button"
              aria-label="Close navigation"
              className="grid size-11 place-items-center rounded-md hover:bg-[var(--landing-tint)]"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="mx-5 mb-7 border-y border-[var(--landing-border)] py-4">
          <p className="text-xs text-[var(--landing-muted)]">Driver workspace</p>
          <p className="mt-1 break-words text-sm font-semibold">
            {user?.name ?? "Your assignments"}
          </p>
        </div>
        <nav
          aria-label={mobile ? "Mobile driver navigation" : "Driver navigation"}
          className="space-y-1 px-3"
        >
          {links.map(({ href, label, Icon }, index) => {
            const active = href === "/driver" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-md border-l-2 px-4 text-sm transition-colors ${index === 3 ? "!mt-8" : ""} ${active ? "border-[var(--landing-accent)] bg-[var(--landing-selection)] font-semibold text-[var(--landing-accent)]" : "border-transparent text-[var(--landing-muted)] hover:bg-[var(--landing-tint)] hover:text-[var(--landing-ink)]"}`}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2 px-6 pb-6 pt-10">
          <p className="break-words text-sm font-medium">{user?.name ?? "Driver"}</p>
          <p className="text-xs text-[var(--landing-muted)]">
            {profile.data
              ? `${profile.data.vehicleType} / ${profile.data.vehiclePlate}`
              : profile.isError
                ? "Profile unavailable"
                : "Loading vehicle..."}
          </p>
          <p className="text-xs text-[var(--landing-accent)]">
            {profile.data
              ? `Availability: ${profile.data.status.replaceAll("_", " ")}`
              : "Availability not loaded"}
          </p>
          <button
            className={`${driverButton} mt-3 w-full`}
            onClick={() => {
              onClose();
              setConfirm(true);
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-[var(--landing-border)] bg-[var(--landing-panel)] lg:flex">
        {navigation(false)}
      </aside>
      <dialog
        ref={dialog}
        aria-label="Driver navigation"
        onCancel={onClose}
        onClose={onClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-[var(--landing-panel)] p-0 text-[var(--landing-ink)] backdrop:bg-black/60"
      >
        <div className="flex min-h-full flex-col">{navigation(true)}</div>
      </dialog>
      {confirm && (
        <FleetDialog
          title="Sign out?"
          onClose={() => {
            if (!signingOut) setConfirm(false);
          }}
        >
          <p className="text-sm leading-6 text-[var(--landing-muted)]">
            This closes your session and clears pending requests kept in this tab. Check any
            uncertain delivery action before signing out.
          </p>
          {signOutError && (
            <p role="alert" className="mt-4 text-sm text-[var(--landing-danger)]">
              {signOutError}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={signingOut}
              className={driverButton}
              onClick={() => setConfirm(false)}
            >
              Stay signed in
            </button>
            <button
              disabled={signingOut}
              className={`${driverButton} border-[var(--landing-danger)]! text-[var(--landing-danger)]!`}
              onClick={() => void signOut()}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </FleetDialog>
      )}
    </>
  );
}

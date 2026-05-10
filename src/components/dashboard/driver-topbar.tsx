"use client";

import { Menu, Bell, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CURRENT_DRIVER } from "@/lib/mock/driver";

// ─── Mock notifications ───────────────────────────────────────────────────────

const NOTIFS = [
  { id: 1, text: "New delivery assigned: IST-K7X2M9PQ", time: "2m ago", unread: true },
  { id: 2, text: "Customer rated your last delivery ★4.9", time: "1h ago", unread: true },
  { id: 3, text: "Payout of ₦14,400 processed", time: "Yesterday", unread: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function DriverTopbar({ title, onMenuClick }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-zinc-950/90 px-4 backdrop-blur-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-sm font-semibold text-zinc-100">{title}</h1>

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-teal-500 text-[7px] font-bold text-white" />
          )}
        </button>

        {/* Dropdown */}
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
            <div className="absolute right-0 top-10 z-20 w-72 rounded-xl border border-white/[0.08] bg-zinc-900 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-sm font-semibold text-zinc-200">Notifications</span>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={14} className="text-zinc-500" />
                </button>
              </div>
              <ul className="divide-y divide-white/[0.04]">
                {NOTIFS.map((n) => (
                  <li key={n.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-start gap-2.5">
                      {n.unread && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                      )}
                      <div className={cn("min-w-0", !n.unread && "pl-4")}>
                        <p className="text-xs text-zinc-300">{n.text}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-600">{n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Avatar */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 text-[10px] font-semibold text-teal-400">
        {CURRENT_DRIVER.avatar}
      </div>
    </header>
  );
}

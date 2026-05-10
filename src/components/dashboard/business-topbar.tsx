"use client";

import { useState } from "react";
import { Menu, Bell, Search, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ─── Mock notifications ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, text: "IST-B3N8R4PT is now in transit", time: "2m ago", unread: true },
  { id: 2, text: "Driver Tunde Fashola accepted IST-W9QK7LMN", time: "8m ago", unread: true },
  { id: 3, text: "IST-K7X2M9PQ delivered successfully", time: "1h ago", unread: false },
  { id: 4, text: "New driver Amina Yusuf joined your fleet", time: "3h ago", unread: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function BusinessTopbar({ title, onMenuClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/[0.05] bg-[#09090b]/95 backdrop-blur-md px-4 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-white flex-1 truncate">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-sky-500 text-[8px] text-white font-bold" />
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-72 rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <p className="text-xs font-semibold text-white">Notifications</p>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div
                        className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${n.unread ? "bg-sky-400" : "bg-transparent"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.unread ? "text-zinc-200" : "text-zinc-500"}`}>
                          {n.text}
                        </p>
                        <p className="text-[10px] text-zinc-700 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.05]">
                  <button className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium">
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/25 to-teal-500/25 border border-sky-500/20 text-[11px] font-bold text-sky-300 uppercase shrink-0">
          {user?.name?.slice(0, 2) ?? "BU"}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Menu, Bell, Search, X, CheckCircle2, Truck, Package, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ─── Mock notifications ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Truck,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10 border-violet-500/15",
    text: "IST-B3N8R4PT is now in transit",
    sub: "Driver Emeka Okafor · Ikeja → VI",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/15",
    text: "Driver Tunde Fashola accepted IST-W9QK7LMN",
    sub: "Shipment is now assigned",
    time: "8m ago",
    unread: true,
  },
  {
    id: 3,
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/15",
    text: "IST-K7X2M9PQ delivered successfully",
    sub: "Delivered to Ikoyi",
    time: "1h ago",
    unread: false,
  },
  {
    id: 4,
    icon: AlertCircle,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/15",
    text: "IST-T6Y4Z8RN delivery failed",
    sub: "Customer unreachable",
    time: "2h ago",
    unread: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function BusinessTopbar({ title, onMenuClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/[0.05] bg-[#09090c]/90 backdrop-blur-xl px-4 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      <div className="flex-1 flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        <span className="hidden sm:block h-3.5 w-px bg-white/[0.08]" />
        <span className="hidden sm:block text-[11px] text-zinc-600">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">

        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 w-48 animate-in fade-in duration-150">
              <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <input
                autoFocus
                placeholder="Search shipments…"
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-600 outline-none"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-sky-500 ring-2 ring-[#09090c]">
                <span className="absolute h-2 w-2 rounded-full bg-sky-400 animate-ping opacity-75" />
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 w-80 rounded-2xl border border-white/[0.08] bg-[#0d0d11] shadow-2xl shadow-black/50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500/20 px-1 text-[9px] font-bold text-sky-400">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          n.unread
                            ? "bg-sky-500/[0.03] hover:bg-sky-500/[0.06]"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${n.iconBg}`}
                        >
                          <Icon className={`h-3 w-3 ${n.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs leading-snug ${n.unread ? "text-zinc-200 font-medium" : "text-zinc-500"}`}
                          >
                            {n.text}
                          </p>
                          <p className="text-[10px] text-zinc-700 mt-0.5">
                            {n.sub}
                          </p>
                          <p className="text-[10px] text-zinc-700 mt-0.5">
                            {n.time}
                          </p>
                        </div>
                        {n.unread && (
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-white/[0.05] text-center">
                  <button className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <span className="h-5 w-px bg-white/[0.06] mx-0.5" />

        {/* User avatar */}
        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.04] transition-all cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-teal-500/30 border border-sky-500/25 text-[11px] font-bold text-sky-300 uppercase ring-1 ring-sky-500/10 ring-offset-1 ring-offset-[#09090c] shrink-0">
            {user?.name?.slice(0, 2) ?? "BU"}
          </div>
          <span className="hidden md:block text-[12px] font-medium text-zinc-400 max-w-[80px] truncate">
            {user?.name?.split(" ")[0] ?? "Business"}
          </span>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  X,
  CheckCircle2,
  Package,
  Star,
  DollarSign,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useDriverProfile } from "@/hooks/use-driver";
import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import type { Notification } from "@/types";

// ─── Notification icon helper ─────────────────────────────────────────────────

function notifIcon(n: Notification) {
  const t = n.title?.toLowerCase() ?? "";
  if (t.includes("deliver") || t.includes("assign"))
    return { Icon: Package,      color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/15" };
  if (t.includes("rat") || t.includes("star"))
    return { Icon: Star,         color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/15"  };
  if (t.includes("pay") || t.includes("earn"))
    return { Icon: DollarSign,   color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/15" };
  if (t.includes("complet") || t.includes("success"))
    return { Icon: CheckCircle2, color: "text-teal-400",   bg: "bg-teal-500/10 border-teal-500/15"   };
  return   { Icon: Info,         color: "text-zinc-400",   bg: "bg-zinc-500/10 border-zinc-500/15"   };
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function DriverTopbar({ title, onMenuClick }: Props) {
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const user              = useAuthStore((s) => s.user);
  const { data: driver }  = useDriverProfile();
  const { notifications, unreadCount } = useNotifications();
  const { mutate: markAllRead }        = useMarkAllNotificationsRead();

  const displayName = user?.name ?? driver?.user?.name ?? "Driver";
  const initials    = getInitials(displayName);

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

      {/* Page title + date */}
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
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 w-44 animate-in fade-in duration-150">
              <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <input
                autoFocus
                placeholder="Search deliveries…"
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
              <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-teal-500 ring-2 ring-[#09090c]">
                <span className="absolute h-2 w-2 rounded-full bg-teal-400 animate-ping opacity-75" />
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-80 max-w-[calc(100vw-1rem)] rounded-2xl border border-white/[0.08] bg-[#0d0d11] shadow-2xl shadow-black/50 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500/20 px-1 text-[9px] font-bold text-teal-400">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead()}
                        className="text-[10px] text-teal-400 hover:text-teal-300 transition-colors font-medium"
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
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                      <Bell className="h-6 w-6 text-zinc-700" />
                      <p className="text-xs text-zinc-600">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((n) => {
                      const { Icon, color, bg } = notifIcon(n);
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                            !n.isRead
                              ? "bg-teal-500/[0.03] hover:bg-teal-500/[0.06]"
                              : "hover:bg-white/[0.02]",
                          )}
                        >
                          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${bg}`}>
                            <Icon className={`h-3 w-3 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-xs leading-snug",
                                !n.isRead ? "text-zinc-200 font-medium" : "text-zinc-500",
                              )}
                            >
                              {n.title}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-1">{n.message}</p>
                            <p className="text-[10px] text-zinc-700 mt-0.5">{relativeTime(n.createdAt)}</p>
                          </div>
                          {!n.isRead && (
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                          )}
                        </div>
                      );
                    })
                  )}
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

        {/* Driver avatar */}
        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.04] transition-all cursor-pointer">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-7 w-7 shrink-0 rounded-full object-cover border border-teal-500/25 ring-1 ring-teal-500/10 ring-offset-1 ring-offset-[#09090c]"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/30 to-emerald-500/30 border border-teal-500/25 text-[11px] font-bold text-teal-300 uppercase ring-1 ring-teal-500/10 ring-offset-1 ring-offset-[#09090c] shrink-0">
              {initials}
            </div>
          )}
          <span className="hidden md:block text-[12px] font-medium text-zinc-400 max-w-[80px] truncate">
            {displayName.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}

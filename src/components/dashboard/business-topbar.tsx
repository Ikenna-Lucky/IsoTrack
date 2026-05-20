"use client";

import { useState } from "react";
import {
  Menu, Bell, Search, X, CheckCircle2, Truck, Package,
  AlertCircle, Loader2, Info,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

// Map notification title keywords to an icon + colour
function notifIcon(n: Notification): { Icon: React.ElementType; color: string; bg: string } {
  const t = n.title.toLowerCase();
  if (t.includes("delivered") || t.includes("picked up") || t.includes("assigned"))
    return { Icon: CheckCircle2, color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/15"     };
  if (t.includes("transit") || t.includes("delivery"))
    return { Icon: Truck,        color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/15" };
  if (t.includes("failed") || t.includes("cancel"))
    return { Icon: AlertCircle,  color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/15"   };
  if (t.includes("created"))
    return { Icon: Package,      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/15" };
  return   { Icon: Info,         color: "text-zinc-400",    bg: "bg-white/[0.06] border-white/[0.08]" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function BusinessTopbar({ title, onMenuClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { notifications, unreadCount, isLoading } = useNotifications();
  const markRead    = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  function handleMarkAllRead() {
    void markAllRead.mutateAsync();
  }

  function handleClickNotif(n: Notification) {
    if (!n.isRead) void markRead.mutateAsync(n.id);
  }

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
          {new Date().toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}
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
                placeholder="Search shipments..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-600 outline-none"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
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
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-sky-500 ring-2 ring-[#09090c]">
                <span className="absolute h-2 w-2 rounded-full bg-sky-400 animate-ping opacity-75" />
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
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
                        onClick={handleMarkAllRead}
                        disabled={markAllRead.isPending}
                        className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors font-medium disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                    </div>
                  )}

                  {!isLoading && notifications.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                      <Bell className="h-6 w-6 text-zinc-700" />
                      <p className="text-xs text-zinc-500 font-medium">No notifications yet</p>
                      <p className="text-[10px] text-zinc-700">
                        You will see shipment updates here as they happen.
                      </p>
                    </div>
                  )}

                  {!isLoading && notifications.map((n) => {
                    const { Icon, color, bg } = notifIcon(n);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleClickNotif(n)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                          !n.isRead ? "bg-sky-500/[0.03] hover:bg-sky-500/[0.06]" : "hover:bg-white/[0.02]",
                        )}
                      >
                        <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border", bg)}>
                          <Icon className={cn("h-3 w-3", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-snug", !n.isRead ? "text-zinc-200 font-medium" : "text-zinc-500")}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-zinc-700 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-white/[0.05] text-center">
                  <Link
                    href="/business/settings"
                    onClick={() => setNotifOpen(false)}
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Notification settings
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <span className="h-5 w-px bg-white/[0.06] mx-0.5" />

        {/* User avatar */}
        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white/[0.04] transition-all cursor-pointer">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name ?? ""}
              className="h-7 w-7 rounded-full object-cover border border-sky-500/25 ring-1 ring-sky-500/10 ring-offset-1 ring-offset-[#09090c] shrink-0"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-teal-500/30 border border-sky-500/25 text-[11px] font-bold text-sky-300 uppercase ring-1 ring-sky-500/10 ring-offset-1 ring-offset-[#09090c] shrink-0">
              {user?.name?.slice(0, 2) ?? "BU"}
            </div>
          )}
          <span className="hidden md:block text-[12px] font-medium text-zinc-400 max-w-[80px] truncate">
            {user?.name?.split(" ")[0] ?? "Business"}
          </span>
        </div>
      </div>
    </header>
  );
}

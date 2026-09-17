"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  DollarSign,
  Info,
  Menu,
  Package,
  Search,
  Star,
  X,
} from "lucide-react";
import { useDriverProfile } from "@/hooks/use-driver";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import { useAuthStore } from "@/store/auth";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

function notifIcon(notification: Notification) {
  const title = notification.title?.toLowerCase() ?? "";
  if (title.includes("deliver") || title.includes("assign")) return { Icon: Package, color: "text-teal-200", bg: "border-teal-400/20 bg-teal-400/10" };
  if (title.includes("rat") || title.includes("star")) return { Icon: Star, color: "text-amber-200", bg: "border-amber-400/20 bg-amber-400/10" };
  if (title.includes("pay") || title.includes("earn")) return { Icon: DollarSign, color: "text-emerald-200", bg: "border-emerald-400/20 bg-emerald-400/10" };
  if (title.includes("complet") || title.includes("success")) return { Icon: CheckCircle2, color: "text-emerald-200", bg: "border-emerald-400/20 bg-emerald-400/10" };
  return { Icon: Info, color: "text-stone-400", bg: "border-white/[0.07] bg-white/[0.04]" };
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase() || "DR";
}

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function DriverTopbar({ title, onMenuClick }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: driver } = useDriverProfile();
  const { notifications, unreadCount } = useNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const displayName = user?.name ?? driver?.user?.name ?? "Driver";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[#080b0a]/92 px-4 backdrop-blur-xl sm:px-6">
      <button onClick={onMenuClick} className="flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200 lg:hidden" aria-label="Open navigation">
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate text-sm font-black text-stone-50">{title}</h1>
        <span className="hidden h-3.5 w-px bg-white/[0.08] sm:block" />
        <span className="hidden text-[11px] font-bold text-stone-600 sm:block">{new Date().toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          {searchOpen ? (
            <div className="hidden w-48 items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 sm:flex">
              <Search className="h-3.5 w-3.5 shrink-0 text-stone-500" />
              <input autoFocus placeholder="Search deliveries..." className="min-w-0 flex-1 bg-transparent text-xs font-bold text-stone-100 outline-none placeholder:text-stone-600" onBlur={() => setSearchOpen(false)} />
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="hidden h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200 sm:flex" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setNotifOpen((value) => !value)} className="relative flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-amber-300 ring-2 ring-[#080b0a]">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-amber-300 opacity-75" />
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-white/[0.08] bg-[#0d1412] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-stone-100">Notifications</p>
                    {unreadCount > 0 && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black text-amber-200">{unreadCount}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && <button onClick={() => markAllRead()} className="text-[10px] font-black text-teal-200 hover:text-teal-100">Mark all read</button>}
                    <button onClick={() => setNotifOpen(false)} className="text-stone-600 transition hover:text-stone-300" aria-label="Close notifications"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="max-h-80 divide-y divide-white/[0.05] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell className="mx-auto h-6 w-6 text-stone-700" />
                      <p className="mt-2 text-xs font-black text-stone-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notification) => {
                      const { Icon, color, bg } = notifIcon(notification);
                      return (
                        <div key={notification.id} className={cn("flex items-start gap-3 px-4 py-3", !notification.isRead ? "bg-teal-400/[0.04]" : "")}>
                          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", bg)}>
                            <Icon className={cn("h-3.5 w-3.5", color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs leading-snug", !notification.isRead ? "font-black text-stone-100" : "font-bold text-stone-500")}>{notification.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-stone-600">{notification.message}</p>
                            <p className="mt-1 text-[10px] text-stone-700">{relativeTime(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <span className="mx-0.5 h-5 w-px bg-white/[0.07]" />
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-white/[0.04]">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={displayName} className="h-7 w-7 shrink-0 rounded object-cover ring-1 ring-teal-400/20" />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">{getInitials(displayName)}</div>
          )}
          <span className="hidden max-w-[90px] truncate text-[12px] font-bold text-stone-400 md:block">{displayName.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}

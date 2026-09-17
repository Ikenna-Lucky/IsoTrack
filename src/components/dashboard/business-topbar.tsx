"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  Loader2,
  Menu,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

function notifIcon(notification: Notification): { Icon: React.ElementType; color: string; bg: string } {
  const title = notification.title.toLowerCase();
  if (title.includes("delivered") || title.includes("picked up") || title.includes("assigned")) {
    return { Icon: CheckCircle2, color: "text-emerald-200", bg: "border-emerald-400/20 bg-emerald-400/10" };
  }
  if (title.includes("transit") || title.includes("delivery")) {
    return { Icon: Truck, color: "text-teal-200", bg: "border-teal-400/20 bg-teal-400/10" };
  }
  if (title.includes("failed") || title.includes("cancel")) {
    return { Icon: AlertCircle, color: "text-rose-200", bg: "border-rose-400/20 bg-rose-400/10" };
  }
  if (title.includes("created")) {
    return { Icon: Package, color: "text-amber-200", bg: "border-amber-400/20 bg-amber-400/10" };
  }
  return { Icon: Info, color: "text-stone-400", bg: "border-white/[0.07] bg-white/[0.04]" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function BusinessTopbar({ title, onMenuClick }: Props) {
  const user = useAuthStore((state) => state.user);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { notifications, unreadCount, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[#080b0a]/92 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate text-sm font-black text-stone-50">{title}</h1>
        <span className="hidden h-3.5 w-px bg-white/[0.08] sm:block" />
        <span className="hidden text-[11px] font-bold text-stone-600 sm:block">
          {new Date().toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          {searchOpen ? (
            <div className="hidden w-52 items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 sm:flex">
              <Search className="h-3.5 w-3.5 shrink-0 text-stone-500" />
              <input
                autoFocus
                placeholder="Search shipments..."
                className="min-w-0 flex-1 bg-transparent text-xs font-bold text-stone-100 outline-none placeholder:text-stone-600"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200 sm:flex"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((value) => !value)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-200"
            aria-label="Open notifications"
          >
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
                    {unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded bg-amber-400/15 px-1 text-[9px] font-black text-amber-200">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => void markAllRead.mutateAsync()}
                        disabled={markAllRead.isPending}
                        className="text-[10px] font-black text-teal-200 transition hover:text-teal-100 disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-stone-600 transition hover:text-stone-300" aria-label="Close notifications">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 divide-y divide-white/[0.05] overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-teal-200" />
                    </div>
                  )}

                  {!isLoading && notifications.length === 0 && (
                    <div className="px-4 py-10 text-center">
                      <Bell className="mx-auto h-6 w-6 text-stone-700" />
                      <p className="mt-2 text-xs font-black text-stone-400">No notifications yet</p>
                      <p className="mt-1 text-[10px] text-stone-700">Shipment updates will appear here.</p>
                    </div>
                  )}

                  {!isLoading &&
                    notifications.map((notification) => {
                      const { Icon, color, bg } = notifIcon(notification);
                      return (
                        <button
                          key={notification.id}
                          onClick={() => {
                            if (!notification.isRead) void markRead.mutateAsync(notification.id);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition",
                            !notification.isRead ? "bg-teal-400/[0.04] hover:bg-teal-400/[0.07]" : "hover:bg-white/[0.03]",
                          )}
                        >
                          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", bg)}>
                            <Icon className={cn("h-3.5 w-3.5", color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs leading-snug", !notification.isRead ? "font-black text-stone-100" : "font-bold text-stone-500")}>
                              {notification.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] text-stone-600">{notification.message}</p>
                            <p className="mt-1 text-[10px] text-stone-700">{timeAgo(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />}
                        </button>
                      );
                    })}
                </div>

                <div className="border-t border-white/[0.07] px-4 py-2.5 text-center">
                  <Link href="/business/settings" onClick={() => setNotifOpen(false)} className="text-[11px] font-bold text-stone-600 transition hover:text-stone-300">
                    Notification settings
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <span className="mx-0.5 h-5 w-px bg-white/[0.07]" />

        <div className="flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-white/[0.04]">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user?.name ?? ""} className="h-7 w-7 shrink-0 rounded object-cover ring-1 ring-teal-400/20" />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">
              {(user?.name ?? "BU").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="hidden max-w-[90px] truncate text-[12px] font-bold text-stone-400 md:block">
            {user?.name?.split(" ")[0] ?? "Business"}
          </span>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Info, MapPin, Menu, Package, X } from "lucide-react";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/use-notifications";
import { useAuthStore } from "@/store/auth";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

function notificationMeta(notification: Notification) {
  const title = notification.title?.toLowerCase() ?? "";
  if (title.includes("deliver") && title.includes("success")) {
    return { Icon: CheckCircle2, color: "text-emerald-300", bg: "border-emerald-400/20 bg-emerald-400/10" };
  }
  if (title.includes("deliver") || title.includes("out for")) {
    return { Icon: MapPin, color: "text-teal-200", bg: "border-teal-400/20 bg-teal-400/10" };
  }
  if (title.includes("assign") || title.includes("pick")) {
    return { Icon: Package, color: "text-amber-200", bg: "border-amber-400/20 bg-amber-400/10" };
  }
  return { Icon: Info, color: "text-stone-400", bg: "border-stone-700 bg-white/[0.04]" };
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

interface Props {
  title: string;
  onMenuClick: () => void;
}

export function CustomerTopbar({ title, onMenuClick }: Props) {
  const user = useAuthStore((state) => state.user);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount } = useNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const initials = (user?.name ?? "CU").slice(0, 2).toUpperCase();
  const firstName = (user?.name ?? "Customer").split(" ")[0];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[#080b0a]/90 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.07] text-stone-400 transition hover:bg-white/[0.05] hover:text-stone-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300/70">
            Customer workspace
          </p>
          <h1 className="truncate text-sm font-black text-stone-100 sm:text-base">{title}</h1>
        </div>
        <span className="hidden h-5 w-px shrink-0 bg-white/[0.08] sm:block" />
        <span className="hidden shrink-0 text-xs font-semibold text-stone-600 sm:block">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.07] text-stone-400 transition hover:bg-white/[0.05] hover:text-stone-100"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-amber-300 ring-2 ring-[#080b0a]" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-20 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-white/[0.1] bg-[#0d1412] shadow-2xl shadow-black/60">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-stone-100">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black text-amber-200">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead()}
                        className="text-[10px] font-bold text-teal-200 transition hover:text-teal-100"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-stone-600 transition hover:text-stone-300"
                      aria-label="Close notifications"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 divide-y divide-white/[0.06] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Bell className="h-6 w-6 text-stone-700" />
                      <p className="text-xs text-stone-600">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notification) => {
                      const { Icon, color, bg } = notificationMeta(notification);
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 px-4 py-3 transition",
                            !notification.isRead ? "bg-teal-400/[0.04]" : "hover:bg-white/[0.03]",
                          )}
                        >
                          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", bg)}>
                            <Icon className={cn("h-3.5 w-3.5", color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs leading-snug", !notification.isRead ? "font-bold text-stone-200" : "text-stone-500")}>
                              {notification.title}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-stone-600">
                              {notification.message}
                            </p>
                            <p className="mt-0.5 text-[10px] text-stone-700">
                              {relativeTime(notification.createdAt)}
                            </p>
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

        <div className="hidden items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-400/10 text-[11px] font-black uppercase text-teal-200 ring-1 ring-teal-400/20">
            {initials}
          </div>
          <span className="max-w-[90px] truncate text-xs font-bold text-stone-400">{firstName}</span>
        </div>
      </div>
    </header>
  );
}

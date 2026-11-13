"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Menu, UserRound, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useOverviewNotifications } from "@/hooks/use-business-overview";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";

export function BusinessTopbar({
  title,
  onMenuClick,
  menuOpen = false,
}: {
  title: string;
  onMenuClick: () => void;
  menuOpen?: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [moreUnread, setMoreUnread] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const query = useOverviewNotifications();
  const cache = useQueryClient();
  const notifications = query.data?.pages.flatMap((page) => page.data) ?? [];
  const unread = notifications.some((item) => !item.isRead);
  const mark = useMutation({
    mutationFn: async (id: string | null) => {
      if (id) {
        await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
        return;
      }
      const result = await api.patch<{ data: { updated: number; hasMore: boolean } }>(
        "/notifications/read-all",
      );
      setMoreUnread(result.data.data.hasMore);
    },
    onSuccess: () => cache.invalidateQueries({ queryKey: ["notifications"] }),
  });
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <header className="relative z-20 flex min-h-20 items-center gap-3 border-b border-[var(--landing-border)] bg-[var(--landing-panel)] px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-expanded={menuOpen}
        aria-label="Open navigation"
        className="grid size-11 place-items-center rounded-md hover:bg-[var(--landing-tint)] lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="hidden text-xs text-[var(--landing-muted)] sm:block">Workspace / Business</p>
        <p className="truncate text-sm font-medium sm:mt-1">{title}</p>
      </div>
      <ThemeToggle />
      <div ref={panel} className="relative">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Notifications"
          aria-expanded={open}
          aria-controls="business-notifications"
          className="relative grid size-11 place-items-center rounded-md border border-[var(--landing-border)] hover:bg-[var(--landing-tint)]"
        >
          <Bell className="size-4" />
          {unread && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-400" />}
        </button>
        {open && (
          <section
            id="business-notifications"
            aria-label="Notifications"
            className="absolute -right-1 top-14 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[var(--landing-border)] bg-[var(--landing-panel)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--landing-border)] p-4">
              <h2 className="font-semibold">Notifications</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
                aria-label="Close notifications"
                className="grid size-9 place-items-center"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[55dvh] overflow-y-auto">
              {query.isPending && (
                <p role="status" className="p-6 text-sm text-[var(--landing-muted)]">
                  Loading updates…
                </p>
              )}
              {query.isError && (
                <div role="alert" className="p-4 text-sm">
                  <p>Could not load updates.</p>
                  <button
                    type="button"
                    onClick={() => void query.refetch()}
                    className="mt-2 underline"
                  >
                    Try again
                  </button>
                </div>
              )}
              {!query.isPending && !query.isError && !notifications.length && (
                <p className="p-6 text-sm text-[var(--landing-muted)]">
                  No updates yet. Shipment notifications will appear here.
                </p>
              )}
              {notifications.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  disabled={mark.isPending || item.isRead}
                  onClick={() => mark.mutate(item.id)}
                  className="flex w-full gap-3 border-b border-[var(--landing-border)] p-4 text-left hover:bg-[var(--landing-tint)] disabled:cursor-default"
                >
                  <span className="mt-1 text-[var(--landing-accent)]">
                    {item.isRead ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="block size-2 rounded-full bg-amber-400" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--landing-muted)]">
                      {item.message}
                    </span>
                  </span>
                </button>
              ))}
              {query.hasNextPage && (
                <button
                  type="button"
                  disabled={query.isFetchingNextPage}
                  onClick={() => void query.fetchNextPage()}
                  className="min-h-11 w-full text-sm text-[var(--landing-accent)]"
                >
                  {query.isFetchingNextPage ? "Loading…" : "Load older updates"}
                </button>
              )}
            </div>
            <div className="space-y-2 p-4 text-xs text-[var(--landing-muted)]">
              {(unread || moreUnread) && (
                <button
                  type="button"
                  disabled={mark.isPending}
                  onClick={() => mark.mutate(null)}
                  className="min-h-9 text-[var(--landing-accent)] disabled:opacity-50"
                >
                  {mark.isPending
                    ? "Marking read…"
                    : moreUnread
                      ? "Mark next batch read"
                      : "Mark all read"}
                </button>
              )}
              {moreUnread && (
                <p role="status">More unread updates remain. Continue with the next batch.</p>
              )}
              {mark.isError && (
                <p role="alert" className="text-[var(--landing-danger)]">
                  Could not mark updates read. Please try again.
                </p>
              )}
              <Link
                href="/business/settings"
                onClick={() => setOpen(false)}
                className="block underline underline-offset-4"
              >
                Notification settings
              </Link>
            </div>
          </section>
        )}
      </div>
      <Link
        href="/business/settings"
        aria-label="Account settings"
        className="ml-2 hidden min-h-11 items-center gap-3 border-l border-[var(--landing-border)] pl-5 sm:flex"
      >
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-[var(--landing-selection)] text-[var(--landing-accent)]">
            <UserRound className="size-4" />
          </span>
        )}
        <span className="hidden max-w-32 truncate text-sm xl:block">{user?.name ?? "Account"}</span>
      </Link>
    </header>
  );
}

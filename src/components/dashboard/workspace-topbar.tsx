"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, UserRound, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceNotifications } from "@/hooks/use-notifications";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { workspaceDateTime } from "@/lib/workspace-format";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { workspaceButton } from "./workspace-ui";

export function WorkspaceTopbar({
  title,
  onMenuClick,
  menuOpen,
  role,
}: {
  title: string;
  onMenuClick: () => void;
  menuOpen: boolean;
  role: "driver" | "customer";
}) {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [moreUnread, setMoreUnread] = useState(false);
  const query = useWorkspaceNotifications(role);
  const cache = useQueryClient();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const records = query.data?.pages.flatMap((page) => page.data) ?? [];
  const unread = records.some((item) => !item.isRead);
  const mark = useMutation({
    mutationFn: async (id: string | null) => {
      if (id) {
        await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
        return;
      }
      const response = await api.patch<{ data: { hasMore: boolean } }>("/notifications/read-all");
      setMoreUnread(response.data.data.hasMore);
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
        onClick={onMenuClick}
        className={`${workspaceButton} px-3! lg:hidden`}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
      >
        <Menu className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="hidden text-xs text-[var(--landing-muted)] sm:block">
          Workspace / {role === "driver" ? "Driver" : "Customer"}
        </p>
        <p className="truncate text-sm font-medium sm:mt-1">{title}</p>
      </div>
      <ThemeToggle />
      <div ref={panel}>
        <button
          ref={trigger}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`${role}-notifications`}
          className={`${workspaceButton} relative px-3!`}
          aria-label={unread ? "Notifications, unread updates loaded" : "Notifications"}
        >
          <Bell className="size-5" />
          {unread && <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-300" />}
        </button>
        {open && (
          <section
            id={`${role}-notifications`}
            aria-label="Notifications"
            className="absolute right-4 top-[calc(100%-0.5rem)] w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-[var(--landing-border)] bg-[var(--landing-panel)] shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--landing-border)] px-4 py-2">
              <h2 className="font-semibold">Notifications</h2>
              <button
                className="grid size-11 place-items-center"
                aria-label="Close notifications"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[55dvh] overflow-y-auto">
              {query.isPending && (
                <p role="status" className="p-5 text-sm text-[var(--landing-muted)]">
                  Loading updates...
                </p>
              )}
              {query.isError && (
                <div role="alert" className="p-4 text-sm text-[var(--landing-danger)]">
                  Could not refresh updates.{" "}
                  <button onClick={() => void query.refetch()} className="min-h-11 underline">
                    Try again
                  </button>
                </div>
              )}
              {query.data && !records.length && (
                <p className="p-5 text-sm text-[var(--landing-muted)]">
                  No notifications recorded. Open your shipment workspace for current records.
                </p>
              )}
              {records.map((item) => (
                <button
                  key={item.id}
                  disabled={mark.isPending || item.isRead}
                  onClick={() => mark.mutate(item.id)}
                  className="block w-full border-b border-[var(--landing-border)] p-4 text-left hover:bg-[var(--landing-tint)] disabled:cursor-default"
                >
                  <span
                    className={`block text-sm font-medium ${item.isRead ? "text-[var(--landing-muted)]" : "text-[var(--landing-accent)]"}`}
                  >
                    {!item.isRead && "Unread: "}
                    {item.title}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-[var(--landing-muted)]">
                    {item.message}
                  </span>
                  <span className="mt-2 block text-xs text-[var(--landing-muted)]">
                    {workspaceDateTime(item.createdAt)}
                  </span>
                </button>
              ))}
              {query.hasNextPage && (
                <button
                  className="min-h-12 w-full text-sm text-[var(--landing-accent)]"
                  disabled={query.isFetchingNextPage}
                  onClick={() => void query.fetchNextPage()}
                >
                  {query.isFetchingNextPage ? "Loading..." : "Load older updates"}
                </button>
              )}
            </div>
            <div className="space-y-2 p-4 text-xs text-[var(--landing-muted)]">
              {(unread || moreUnread) && (
                <button
                  className={workspaceButton}
                  disabled={mark.isPending}
                  onClick={() => mark.mutate(null)}
                >
                  {mark.isPending
                    ? "Marking read..."
                    : moreUnread
                      ? "Mark next batch read"
                      : "Mark all read"}
                </button>
              )}
              {moreUnread && (
                <p role="status">More unread updates remain. Mark the next batch to continue.</p>
              )}
              {mark.isError && (
                <p role="alert" className="text-[var(--landing-danger)]">
                  Could not mark updates read. Try again.
                </p>
              )}
              <p>Unread state describes loaded updates.</p>
            </div>
          </section>
        )}
      </div>
      <Link
        href={role === "driver" ? "/driver/settings" : "/customer/settings"}
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

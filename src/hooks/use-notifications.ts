"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notification, ApiResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const notificationKeys = {
  all:  ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the current user's notifications, newest first.
 * Refetches every 60 s so the bell icon stays current.
 */
export function useNotifications() {
  const query = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>("/notifications");
      return data.data;
    },
    refetchInterval: 60_000,
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { ...query, notifications, unreadCount };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Mark a single notification as read. Optimistically updates the cache. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = qc.getQueryData<Notification[]>(notificationKeys.list());
      qc.setQueryData<Notification[]>(notificationKeys.list(), (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData<Notification[]>(notificationKeys.list(), ctx.previous);
      }
    },
  });
}

/** Mark all notifications as read. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = qc.getQueryData<Notification[]>(notificationKeys.list());
      qc.setQueryData<Notification[]>(notificationKeys.list(), (old) =>
        old?.map((n) => ({ ...n, isRead: true })) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData<Notification[]>(notificationKeys.list(), ctx.previous);
      }
    },
  });
}

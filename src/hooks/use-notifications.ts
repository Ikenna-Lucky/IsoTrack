"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { Notification, ApiResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
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

  return {
    ...query,
    notifications,
    unreadCount,
  };
}

/** Mark a single notification as read. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.list() });
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

/** Cursor inbox: unread state and counts only describe loaded notifications. */
export function useDriverNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications", "driver-inbox-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<Notification>>("/notifications", {
          signal,
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
        })
      ).data,
    getNextPageParam: nextPageCursor<Notification>,
    refetchInterval: 60000,
  });
}

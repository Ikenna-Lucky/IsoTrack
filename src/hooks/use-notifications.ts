"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { Notification } from "@/types";

/** Cursor inbox: unread state and counts only describe loaded notifications. */
export function useWorkspaceNotifications(role: "driver" | "customer") {
  return useInfiniteQuery({
    queryKey: ["notifications", role, "inbox-cursor"],
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

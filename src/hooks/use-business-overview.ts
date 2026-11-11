"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { Shipment, Notification } from "@/types";

// Separate keys keep legacy page-based consumers from reading cursor responses.
export function useOverviewShipments() {
  return useInfiniteQuery({
    queryKey: ["shipments", "overview-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.get<CursorPage<Shipment>>("/shipments", {
        params: { limit: 6, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      });
      return response.data;
    },
    getNextPageParam: nextPageCursor<Shipment>,
  });
}

export function useOverviewNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications", "overview-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.get<CursorPage<Notification>>("/notifications", {
        params: { limit: 10, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      });
      return response.data;
    },
    getNextPageParam: nextPageCursor<Notification>,
    refetchInterval: 60_000,
  });
}

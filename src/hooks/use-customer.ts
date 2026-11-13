"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { CustomerShipmentRecord } from "@/lib/customer-workspace";
import type { ApiResponse, ShipmentEvent } from "@/types";
export function useCustomerShipments() {
  return useInfiniteQuery({
    queryKey: ["shipments", "customer-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<CustomerShipmentRecord>>("/shipments", {
          signal,
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
        })
      ).data,
    getNextPageParam: nextPageCursor<CustomerShipmentRecord>,
    refetchInterval: 60000,
  });
}
export function useCustomerShipment(id: string) {
  return useQuery({
    queryKey: ["shipments", "customer-detail", id],
    queryFn: async ({ signal }) =>
      (
        await api.get<ApiResponse<CustomerShipmentRecord>>(`/shipments/${encodeURIComponent(id)}`, {
          signal,
        })
      ).data.data,
    enabled: !!id,
    refetchInterval: 30000,
  });
}
export function useCustomerHistory(id: string) {
  return useInfiniteQuery({
    queryKey: ["shipments", "customer-events", id],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<ShipmentEvent>>(`/shipments/${encodeURIComponent(id)}/events`, {
          signal,
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
        })
      ).data,
    getNextPageParam: nextPageCursor<ShipmentEvent>,
    enabled: !!id,
  });
}

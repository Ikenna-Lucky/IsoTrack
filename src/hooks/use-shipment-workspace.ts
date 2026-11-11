"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { WorkspaceShipment, NewShipment } from "@/lib/shipment-workspace";
import type { ApiResponse, ShipmentEvent } from "@/types";
import type { FleetDriver } from "@/lib/fleet-contract";

export function useShipmentManifest() {
  return useInfiniteQuery({
    queryKey: ["shipments", "business-manifest"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<WorkspaceShipment>>("/shipments", {
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
          signal,
        })
      ).data,
    getNextPageParam: nextPageCursor<WorkspaceShipment>,
  });
}
export function useWorkspaceShipment(id: string) {
  return useQuery({
    queryKey: ["shipments", "workspace-detail", id],
    queryFn: async ({ signal }) =>
      (
        await api.get<ApiResponse<WorkspaceShipment>>(`/shipments/${encodeURIComponent(id)}`, {
          signal,
        })
      ).data.data,
  });
}
export function useShipmentHistory(id: string) {
  return useInfiniteQuery({
    queryKey: ["shipments", "workspace-history", id],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<ShipmentEvent>>(`/shipments/${encodeURIComponent(id)}/events`, {
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
          signal,
        })
      ).data,
    getNextPageParam: nextPageCursor<ShipmentEvent>,
  });
}
export function useDispatchDrivers(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["drivers", "dispatch-available"],
    enabled,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<FleetDriver>>("/drivers/available", {
          params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
          signal,
        })
      ).data,
    getNextPageParam: nextPageCursor<FleetDriver>,
  });
}
export type ShipmentAction =
  | { key: string; kind: "create"; body: NewShipment }
  | {
      key: string;
      kind: "assign" | "cancel";
      id: string;
      body: { expectedVersion: number; driverId?: string };
    };
export function useShipmentAction() {
  const cache = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (action: ShipmentAction) => {
      const headers = { "Idempotency-Key": action.key };
      if (action.kind === "create")
        return (
          await api.post<ApiResponse<WorkspaceShipment>>("/shipments", action.body, { headers })
        ).data.data;
      const url = `/shipments/${encodeURIComponent(action.id)}`;
      return action.kind === "assign"
        ? (
            await api.patch<ApiResponse<WorkspaceShipment>>(`${url}/assign`, action.body, {
              headers,
            })
          ).data.data
        : (await api.delete<ApiResponse<WorkspaceShipment>>(url, { data: action.body, headers }))
            .data.data;
    },
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["shipments"] });
      void cache.invalidateQueries({ queryKey: ["drivers"] });
      void cache.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

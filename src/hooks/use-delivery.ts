"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowRequest } from "./use-workflow-request";
import type { DeliveryChallenge } from "@/lib/delivery-contract";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type { WorkspaceShipment } from "@/lib/shipment-workspace";
import type { ApiResponse } from "@/types";

export function useDriverDeliveryQueue() {
  return useInfiniteQuery({
    queryKey: ["shipments", "driver-delivery-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<CursorPage<WorkspaceShipment>>("/shipments", {
          signal,
          params: {
            limit: 20,
            includeCompleted: "true",
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
      ).data,
    getNextPageParam: nextPageCursor<WorkspaceShipment>,
  });
}
export function useDeliveryChallenge(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["shipments", "delivery-challenge", id],
    enabled,
    retry: false,
    refetchInterval: 10000,
    queryFn: async ({ signal }) => {
      try {
        return (
          await api.get<ApiResponse<DeliveryChallenge>>(
            `/shipments/${encodeURIComponent(id)}/delivery-code`,
            { signal },
          )
        ).data.data;
      } catch (error) {
        if ((error as { response?: { status: number } }).response?.status === 404) return null;
        throw error;
      }
    },
  });
}
export type DeliveryRequest =
  | { kind: "issue"; key: string; body: { expectedVersion: number; recipientEmail: string } }
  | {
      kind: "confirm";
      key: string;
      body: { expectedVersion: number; challengeId: string; code: string };
    }
  | {
      kind: "progress";
      key: string;
      body: { expectedVersion: number; status: "picked_up" | "in_transit" | "out_for_delivery" };
    };
// Codes remain in account-scoped request memory, never browser storage or caches.
export function usePendingDeliveryRequest(id: string) {
  return useWorkflowRequest<DeliveryRequest>("delivery", id);
}
export async function sendDeliveryRequest(id: string, request: DeliveryRequest) {
  const path = `/shipments/${encodeURIComponent(id)}`;
  const options = { headers: { "Idempotency-Key": request.key } };
  if (request.kind === "progress") await api.patch(`${path}/status`, request.body, options);
  else
    await api.post(
      `${path}/${request.kind === "issue" ? "delivery-code" : "confirm-delivery"}`,
      request.body,
      options,
    );
}

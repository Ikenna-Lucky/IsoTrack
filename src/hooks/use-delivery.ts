"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
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
// Codes live only in component/request memory. Never query/mutation caches or storage.
const requests = new Map<string, DeliveryRequest>();
if (typeof window !== "undefined")
  window.addEventListener("beforeunload", (event) => {
    if (requests.size) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
export function usePendingDeliveryRequest(id: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const key = `${userId}:${id}`;
  const [request, setRequest] = useState<DeliveryRequest | null>(() => requests.get(key) ?? null);
  useEffect(() => {
    setRequest(requests.get(key) ?? null);
  }, [key]);
  return [
    request,
    (next: DeliveryRequest | null) => {
      if (next) requests.set(key, next);
      else requests.delete(key);
      setRequest(next);
    },
  ] as const;
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

"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { publicTrackingSchema, type PublicTracking } from "@/lib/tracking-contract";
import type { ApiResponse } from "@/types";
export type TrackingInfo = PublicTracking;
export const trackingKeys = {
  all: ["tracking"] as const,
  detail: (id: string) => ["tracking", id] as const,
};
export function useTracking(id: string | null | undefined) {
  return useQuery({
    queryKey: trackingKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: async ({ signal }) =>
      publicTrackingSchema.parse(
        (
          await api.get<ApiResponse<PublicTracking>>(`/track/${encodeURIComponent(id ?? "")}`, {
            signal,
          })
        ).data.data,
      ),
    refetchInterval: (query) =>
      ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(
        query.state.data?.status ?? "",
      )
        ? 15000
        : false,
  });
}

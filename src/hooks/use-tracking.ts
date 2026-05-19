"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const trackingKeys = {
  all:    ["tracking"] as const,
  detail: (trackingId: string) => [...trackingKeys.all, trackingId] as const,
};

// ─── Public tracking response shape ───────────────────────────────────────────

export interface TrackingInfo {
  trackingId: string;
  status: string;
  description: string;
  pickupAddress: { street: string; city: string; state: string };
  deliveryAddress: { street: string; city: string; state: string };
  currentLocation: { lat: number; lng: number } | null;
  scheduledPickup: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  events: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
  driver: {
    name: string;
    vehicleType: string;
    vehiclePlate: string;
    rating: number;
    currentLocation: { lat: number; lng: number } | null;
  } | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Public tracking hook — no auth required.
 * Refetches every 15 s when the shipment is actively in transit.
 */
export function useTracking(trackingId: string | null | undefined) {
  return useQuery({
    queryKey: trackingKeys.detail(trackingId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TrackingInfo>>(
        `/track/${trackingId}`,
      );
      return data.data;
    },
    enabled: !!trackingId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const isActive =
        status === "in_transit" ||
        status === "out_for_delivery" ||
        status === "picked_up";
      return isActive ? 15_000 : false;
    },
  });
}

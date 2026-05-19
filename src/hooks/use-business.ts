"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Business, Shipment, ApiResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const businessKeys = {
  all:       ["business"] as const,
  profile:   () => [...businessKeys.all, "profile"] as const,
  analytics: () => [...businessKeys.all, "analytics"] as const,
};

// ─── Analytics response shape ─────────────────────────────────────────────────

export interface BusinessAnalytics {
  statusBreakdown: Record<string, number>;
  totalShipments: number;
  totalRevenueKobo: number;
  recentShipments: Shipment[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Returns the logged-in business's profile (name, address, etc.)
 */
export function useBusinessProfile() {
  return useQuery({
    queryKey: businessKeys.profile(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Business>>("/business/profile");
      return data.data;
    },
  });
}

/**
 * Returns aggregated analytics for the business:
 * status breakdown, total shipments, total revenue, recent shipments.
 * Refetches every 60 s.
 */
export function useBusinessAnalytics() {
  return useQuery({
    queryKey: businessKeys.analytics(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BusinessAnalytics>>("/business/analytics");
      return data.data;
    },
    refetchInterval: 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Update the business profile (name, address). */
export function useUpdateBusinessProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      businessName?: string;
      address?: { street: string; city: string; state: string };
    }) => {
      const { data } = await api.patch<ApiResponse<unknown>>("/business/profile", input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Shipment, ShipmentStatus, PaginatedResponse, ApiResponse } from "@/types";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateShipmentInput {
  description: string;
  weightKg: number;
  pickupAddress: { street: string; city: string; state: string };
  deliveryAddress: { street: string; city: string; state: string };
  priceKobo: number;
  customerId?: string;
  scheduledPickup?: string; // ISO datetime
}

// ─── Query key factory ────────────────────────────────────────────────────────

export const shipmentKeys = {
  all:    ["shipments"] as const,
  lists:  () => [...shipmentKeys.all, "list"] as const,
  list:   (params: Record<string, unknown>) => [...shipmentKeys.lists(), params] as const,
  detail: (id: string) => [...shipmentKeys.all, "detail", id] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseShipmentsParams {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches the current user's shipments.
 * The backend returns the right set based on the user's role:
 *   business  → paginated list of all their shipments
 *   driver    → their currently active/assigned shipments
 *   customer  → all shipments linked to them
 */
export function useShipments({ page = 1, pageSize = 20, enabled = true }: UseShipmentsParams = {}) {
  return useQuery({
    queryKey: shipmentKeys.list({ page, pageSize }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Shipment> | ApiResponse<Shipment[]>>(
        "/shipments",
        { params: { page, pageSize } },
      );
      return data;
    },
    enabled,
  });
}

/**
 * Fetches a single shipment by its database ID.
 */
export function useShipment(id: string | null | undefined) {
  return useQuery({
    queryKey: shipmentKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Shipment>>(`/shipments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Convenience hook for driver pages: returns the first shipment that is
 * actively in-progress (out_for_delivery or in_transit).
 */
export function useActiveDelivery() {
  const query = useShipments();
  const shipments = getShipmentList(query.data);
  const active = shipments.find(
    (s) => s.status === "out_for_delivery" || s.status === "in_transit",
  ) ?? null;

  return { ...query, activeDelivery: active };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new shipment (business only). */
export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateShipmentInput) => {
      const { data } = await api.post<ApiResponse<Shipment>>("/shipments", input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/** Update a shipment's status (business or driver). */
export function useUpdateShipmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: ShipmentStatus;
      note?: string;
    }) => {
      const { data } = await api.patch<ApiResponse<Shipment>>(
        `/shipments/${id}/status`,
        { status, note },
      );
      return data.data;
    },
    onSuccess: (updated, { id }) => {
      // Push the fresh data into the cache immediately (no re-fetch needed)
      qc.setQueryData<Shipment>(shipmentKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/** Assign a driver to a pending shipment (business only). */
export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shipmentId,
      driverId,
    }: {
      shipmentId: string;
      driverId: string;
    }) => {
      const { data } = await api.patch<ApiResponse<Shipment>>(
        `/shipments/${shipmentId}/assign`,
        { driverId },
      );
      return data.data;
    },
    onSuccess: (updated, { shipmentId }) => {
      qc.setQueryData<Shipment>(shipmentKeys.detail(shipmentId), updated);
      qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/** Cancel a shipment (business only). */
export function useCancelShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/shipments/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise the two possible response shapes into a flat array. */
export function getShipmentList(
  data: PaginatedResponse<Shipment> | ApiResponse<Shipment[]> | undefined,
): Shipment[] {
  if (!data) return [];
  // Paginated response has `data.data` as an array + `data.pagination`
  if ("pagination" in data) return data.data;
  // Plain response has `data.data` as an array
  if (Array.isArray(data.data)) return data.data;
  return [];
}

/** Convenience: pull pagination info out of a paginated response. */
export function getPagination(
  data: PaginatedResponse<Shipment> | ApiResponse<Shipment[]> | undefined,
) {
  if (!data || !("pagination" in data)) return null;
  return data.pagination;
}

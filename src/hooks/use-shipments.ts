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
  customerId?: string | undefined;
  customerEmail?: string | undefined;   // links shipment to customer's account by email
  scheduledPickup?: string | undefined; // ISO datetime
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
  page?: number | undefined;
  pageSize?: number | undefined;
  enabled?: boolean | undefined;
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

// ─── Mutations ────────────────────────────────────────────────────────────────


// ─── Utility helpers ──────────────────────────────────────────────────────────

type RawShipmentsData =
  | { data: Shipment[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number } }
  | undefined;

/** Normalises both paginated and plain-array API responses → Shipment[]. */
export function getShipmentList(raw: RawShipmentsData): Shipment[] {
  if (!raw) return [];
  return (raw as { data: Shipment[] }).data ?? [];
}

/** Returns pagination metadata when the response is paginated, otherwise null. */
export function getPagination(
  raw: RawShipmentsData,
): { page: number; pageSize: number; total: number; totalPages: number } | null {
  if (!raw) return null;
  const p = (raw as { pagination?: { page: number; pageSize: number; total: number; totalPages: number } }).pagination;
  return p ?? null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Assign a driver to a pending shipment (business only). */
export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, driverId }: { id: string; driverId: string }) => {
      const { data } = await api.patch<ApiResponse<Shipment>>(`/shipments/${id}/assign`, { driverId });
      return data.data;
    },
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: shipmentKeys.detail(updated.id) });
    },
  });
}

/** Create a new shipment (business only). */
export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateShipmentInput) => {
      const { data } = await api.post<ApiResponse<Shipment>>("/shipments", input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/** Cancel (soft-delete) a pending shipment (business only). */
export function useCancelShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/shipments/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
  });
}

/** Update the status of a shipment (driver / business). */
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
      note?: string | undefined;
    }) => {
      const { data } = await api.patch<ApiResponse<Shipment>>(
        `/shipments/${id}/status`,
        { status, note },
      );
      return data.data;
    },
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: shipmentKeys.lists() });
            void qc.invalidateQueries({ queryKey: shipmentKeys.detail(updated.id) });
    },
  });
}

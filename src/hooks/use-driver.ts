"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Driver, DriverStatus, ApiResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const driverKeys = {
  all:     ["drivers"] as const,
  me:      () => [...driverKeys.all, "me"] as const,
  lists:   () => [...driverKeys.all, "list"] as const,
  detail:  (id: string) => [...driverKeys.all, "detail", id] as const,
  available: () => [...driverKeys.all, "available"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Returns the logged-in driver's own profile (vehicle, status, rating, etc.)
 * Only usable when role === "driver".
 */
export function useDriverProfile() {
  return useQuery({
    queryKey: driverKeys.me(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Driver>>("/drivers/me");
      return data.data;
    },
  });
}

/**
 * Returns a specific driver by database ID.
 * Usable by business users to view a driver's details.
 */
export function useDriver(id: string | null | undefined) {
  return useQuery({
    queryKey: driverKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Driver>>(`/drivers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Returns all drivers — for business dashboards.
 */
export function useDrivers() {
  return useQuery({
    queryKey: driverKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Driver[]>>("/drivers");
      return data.data;
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Toggle the driver's online/offline status.
 * Optimistically updates the cache so the UI feels instant.
 */
export function useUpdateDriverStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      driverId,
      status,
    }: {
      driverId: string;
      status: DriverStatus;
    }) => {
      const { data } = await api.patch<ApiResponse<Driver>>(
        `/drivers/${driverId}/status`,
        { status },
      );
      return data.data;
    },
    // Optimistic update — flip the status in the cache before the server responds
    onMutate: async ({ status }) => {
      await qc.cancelQueries({ queryKey: driverKeys.me() });
      const previous = qc.getQueryData<Driver>(driverKeys.me());
      qc.setQueryData<Driver>(driverKeys.me(), (old) =>
        old ? { ...old, status } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back on error
      if (ctx?.previous) {
        qc.setQueryData<Driver>(driverKeys.me(), ctx.previous);
      }
    },
    onSuccess: (updated) => {
      qc.setQueryData<Driver>(driverKeys.me(), updated);
    },
  });
}

/**
 * Update the driver's GPS location (called periodically while delivering).
 * No cache invalidation needed — location is a fire-and-forget update.
 */
export function useUpdateDriverLocation() {
  return useMutation({
    mutationFn: async ({
      driverId,
      lat,
      lng,
    }: {
      driverId: string;
      lat: number;
      lng: number;
    }) => {
      const { data } = await api.patch<ApiResponse<Driver>>(
        `/drivers/${driverId}/location`,
        { lat, lng },
      );
      return data.data;
    },
  });
}

// ─── Queries (continued) ──────────────────────────────────────────────────────

/**
 * Returns only drivers whose status is "available" — for shipment assignment.
 */
export function useAvailableDrivers() {
  return useQuery({
    queryKey: driverKeys.available(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Driver[]>>("/drivers/available");
      return data.data;
    },
    // Refetch every 20 s so the list stays current while assigning shipments
    refetchInterval: 20_000,
  });
}

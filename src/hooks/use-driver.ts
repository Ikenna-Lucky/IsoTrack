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
    mutationFn: async (status: "available" | "on_delivery" | "offline") => {
      const { data } = await api.patch<ApiResponse<Driver>>("/drivers/me/status", { status });
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(driverKeys.me(), updated);
      void qc.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

/**
 * Update the driver's vehicle type and/or plate number.
 * Invalidates the driver profile query on success.
 */
export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { vehicleType?: "bike" | "car" | "van" | "truck"; vehiclePlate?: string }) => {
      const { data } = await api.patch<ApiResponse<Driver>>("/drivers/me", input);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(driverKeys.me(), updated);
    },
  });
}

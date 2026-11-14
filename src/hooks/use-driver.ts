"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Driver, NotificationPreferences, ApiResponse } from "@/types";

export const driverKeys = {
  all: ["drivers"] as const,
  me: () => [...driverKeys.all, "me"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
  available: () => [...driverKeys.all, "available"] as const,
};

// Requires a driver session.
export function useDriverProfile() {
  return useQuery({
    queryKey: driverKeys.me(),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Driver>>("/drivers/me", { signal });
      return data.data;
    },
  });
}

// Business users can only read drivers in their own fleet.
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

export function useDrivers() {
  return useQuery({
    queryKey: driverKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Driver[]>>("/drivers");
      return data.data;
    },
  });
}

// PATCH omits the nested user; preserve it when merging the saved profile.
export function useUpdateDriverStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: "available" | "on_delivery" | "offline") => {
      const { data } = await api.patch<ApiResponse<Omit<Driver, "user">>>("/drivers/me/status", { status });
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Driver>(driverKeys.me(), (previous) =>
        previous ? { ...previous, ...updated } : undefined,
      );
      void qc.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

// Keep the nested user from GET /drivers/me when merging the PATCH response.
export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vehicleType?: "bike" | "car" | "van" | "truck";
      vehiclePlate?: string | undefined;
      vehicleModel?: string | null | undefined;
      vehicleColor?: string | null | undefined;
      vehicleYear?: string | null | undefined;
      vehicleInsurance?: string | null | undefined;
    }) => {
      const { data } = await api.patch<ApiResponse<Omit<Driver, "user">>>("/drivers/me", input);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData<Driver>(driverKeys.me(), (previous) =>
        previous ? { ...previous, ...updated } : undefined,
      );
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: [...driverKeys.me(), "notifications"] as const,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<NotificationPreferences>>(
        "/drivers/me/notifications",
        { signal },
      );
      return data.data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const { data } = await api.patch<ApiResponse<NotificationPreferences>>(
        "/drivers/me/notifications",
        prefs,
      );
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData<NotificationPreferences>([...driverKeys.me(), "notifications"], (previous) =>
        previous ? { ...previous, ...updated } : undefined,
      );
      void qc.invalidateQueries({ queryKey: [...driverKeys.me(), "notifications"] });
    },
  });
}

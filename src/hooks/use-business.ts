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
      businessName?: string | undefined;
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

// Notification preferences shape
export interface BusinessNotifPrefs {
  shipmentCreated: { email: boolean; sms: boolean };
  driverAssigned:  { email: boolean; sms: boolean };
  pickedUp:        { email: boolean; sms: boolean };
  outForDelivery:  { email: boolean; sms: boolean };
  delivered:       { email: boolean; sms: boolean };
  failed:          { email: boolean; sms: boolean };
  driverOnline:    { email: boolean; sms: boolean };
  weeklyReport:    { email: boolean; sms: boolean };
}

// Preferences shape
export interface BusinessPreferences {
  timezone:    string;
  currency:    string;
  language:    string;
  dateFormat:  string;
  compactView: boolean;
  autoRefresh: boolean;
}

/** GET /business/notifications */
export function useBusinessNotifPrefs() {
  return useQuery({
    queryKey: [...businessKeys.all, "notifications"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BusinessNotifPrefs>>("/business/notifications");
      return data.data;
    },
  });
}

/** PATCH /business/notifications */
export function useUpdateBusinessNotifPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<BusinessNotifPrefs>) => {
      const { data } = await api.patch<ApiResponse<BusinessNotifPrefs>>("/business/notifications", prefs);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData([...businessKeys.all, "notifications"], updated);
    },
  });
}

/** GET /business/preferences */
export function useBusinessPreferences() {
  return useQuery({
    queryKey: [...businessKeys.all, "preferences"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BusinessPreferences>>("/business/preferences");
      return data.data;
    },
  });
}

/** PATCH /business/preferences */
export function useUpdateBusinessPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<BusinessPreferences>) => {
      const { data } = await api.patch<ApiResponse<BusinessPreferences>>("/business/preferences", prefs);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData([...businessKeys.all, "preferences"], updated);
    },
  });
}

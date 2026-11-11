"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { nextPageCursor, type CursorPage } from "@/lib/business-overview";
import type {
  FleetDriver,
  FleetInvitation,
  CreatedInvitation,
  FleetShipment,
} from "@/lib/fleet-contract";
import { driverKeys } from "./use-driver";
import type { ApiResponse } from "@/types";

export function useFleet() {
  return useInfiniteQuery({
    queryKey: ["drivers", "fleet-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.get<CursorPage<FleetDriver>>("/drivers", {
        params: { limit: 12, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      });
      return response.data;
    },
    getNextPageParam: nextPageCursor<FleetDriver>,
  });
}
export function useFleetInvitations() {
  return useQuery({
    queryKey: ["fleet-invitations"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiResponse<FleetInvitation[]>>("/driver-invitations", {
        signal,
      });
      return response.data.data;
    },
  });
}
export function useCreateFleetInvitation() {
  const cache = useQueryClient();
  return useMutation({
    // The one-time token belongs in component memory, never mutation/query caches.
    mutationFn: async ({
      email,
      receive,
    }: {
      email: string;
      receive: (invitation: CreatedInvitation) => void;
    }) => {
      const response = await api.post<ApiResponse<CreatedInvitation>>("/driver-invitations", {
        email,
      });
      receive(response.data.data);
    },
    retry: false,
    gcTime: 0,
    onSettled: () => cache.invalidateQueries({ queryKey: ["fleet-invitations"] }),
  });
}
export function useRevokeFleetInvitation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/driver-invitations/${encodeURIComponent(id)}`);
    },
    onSettled: () => cache.invalidateQueries({ queryKey: ["fleet-invitations"] }),
  });
}
export function useFleetAssignments() {
  return useInfiniteQuery({
    queryKey: ["shipments", "fleet-assignments-cursor"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.get<CursorPage<FleetShipment>>("/shipments", {
        params: { limit: 20, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      });
      return response.data;
    },
    getNextPageParam: nextPageCursor<FleetShipment>,
  });
}
export function useAcceptExistingFleet() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post("/driver-invitations/accept-existing", { token });
    },
    retry: false,
    gcTime: 0,
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: driverKeys.all });
      await cache.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
}

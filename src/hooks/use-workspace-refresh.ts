"use client";
import { useAuthStore } from "@/store/auth";
import { useBusinessPreferences } from "./use-business";
import { workspaceRefresh } from "@/lib/business-preferences";

export function useWorkspaceRefresh(interval: number, otherRoleInterval: number | false = false) {
  const business = useAuthStore((state) => state.user?.role === "business");
  const preferences = useBusinessPreferences(business);
  const enabled = !business || preferences.data?.autoRefresh === true;
  return {
    refetchInterval: business ? workspaceRefresh(enabled, interval) : otherRoleInterval,
    refetchOnWindowFocus: enabled,
    refetchOnReconnect: enabled,
  };
}

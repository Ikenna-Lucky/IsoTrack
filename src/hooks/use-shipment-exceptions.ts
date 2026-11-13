"use client";
import { useWorkspaceRefresh } from "./use-workspace-refresh";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  nextExceptionVersion,
  type ExceptionPage,
  type ExceptionInput,
} from "@/lib/shipment-exceptions";
import { useWorkflowRequest } from "./use-workflow-request";
export function useExceptionHistory(id: string, enabled: boolean) {
  const refresh = useWorkspaceRefresh(60000);
  return useInfiniteQuery({
    ...refresh,
    queryKey: ["shipments", "exception-history", id],
    enabled,
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam, signal }) =>
      (
        await api.get<ExceptionPage>(`/shipments/${encodeURIComponent(id)}/exceptions`, {
          signal,
          params: { limit: 20, ...(pageParam !== null ? { beforeVersion: pageParam } : {}) },
        })
      ).data,
    getNextPageParam: nextExceptionVersion,
  });
}
export interface ExceptionRequest {
  key: string;
  body: ExceptionInput;
}
export function usePendingException(id: string) {
  return useWorkflowRequest<ExceptionRequest>("exception", id);
}
export async function sendException(id: string, request: ExceptionRequest) {
  await api.post(`/shipments/${encodeURIComponent(id)}/exceptions`, request.body, {
    headers: { "Idempotency-Key": request.key },
  });
}

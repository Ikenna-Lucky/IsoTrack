"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0, // Retrying writes needs explicit handling to avoid duplicate actions.
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Keep one client per mounted provider; clear its cache when the account changes.
  const [queryClient] = useState(() => makeQueryClient());
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (state.user?.id !== previous.user?.id) queryClient.clear();
      }),
    [queryClient],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

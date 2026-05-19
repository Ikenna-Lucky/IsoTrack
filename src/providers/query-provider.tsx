"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

/**
 * Creates a fresh QueryClient per session.
 *
 * Key decisions:
 * - staleTime 30s  — data is considered fresh for 30 s; avoids waterfall
 *   re-fetches when navigating between pages quickly.
 * - gcTime 5 min   — keep unused cache in memory for 5 minutes so switching
 *   tabs feels instant.
 * - retry 1        — retry failed requests once before surfacing the error.
 *   We don't retry on 401/403 (those are user errors, not transient).
 * - refetchOnWindowFocus true — important for a real-time logistics app so
 *   data refreshes when the dispatcher switches back to the tab.
 * - Global 401 handler — if the axios interceptor couldn't refresh the token,
 *   any query/mutation that rejects with 401 will force a logout here.
 */
function makeQueryClient() {
  const handle401 = () => {
    const { isAuthenticated, clearAuth } = useAuthStore.getState();
    if (isAuthenticated) clearAuth();
  };

  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401) handle401();
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401) handle401();
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,        // 30 seconds
        gcTime: 5 * 60 * 1000,       // 5 minutes
        retry: (failureCount, error: unknown) => {
          // Never retry on auth / permission errors
          const status = (error as { response?: { status?: number } })
            ?.response?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0, // mutations are never retried automatically
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures a new client is created per component mount (not per render),
  // preventing cache from being shared across server renders in Next.js.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

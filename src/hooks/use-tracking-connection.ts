"use client";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";
import { refreshSession } from "@/lib/api";
export function useTrackingConnection(enabled: boolean) {
  const token = useAuthStore((s) => s.accessToken);
  const account = useAuthStore((s) => s.user?.id);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const lastRefresh = useRef(0);
  useEffect(() => {
    if (!enabled || !token || !account) return;
    let disposed = false,
      refreshed = false;
    const connection = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000", {
      auth: { token },
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
    setSocket(connection);
    async function renew() {
      if (disposed || refreshed) return;
      refreshed = true;
      // A capacity rejection or dependency outage must not create a token-refresh loop.
      if (Date.now() - lastRefresh.current < 30000) {
        setError("Tracking could not reconnect. Wait a moment, then retry.");
        return;
      }
      lastRefresh.current = Date.now();
      try {
        const session = await refreshSession();
        if (!disposed && session.accessToken === token) {
          connection.auth = { token: session.accessToken };
          connection.connect();
        }
      } catch {
        if (!disposed) setError("Tracking session ended. Sign in again.");
      }
    }
    connection.on("connect", () => {
      setConnected(true);
      setError("");
    });
    connection.on("disconnect", (reason) => {
      setConnected(false);
      if (reason === "io server disconnect") void renew();
    });
    connection.on("connect_error", (cause) => {
      setConnected(false);
      setError("Tracking connection unavailable. Retry when your connection is restored.");
      if ((cause as Error & { data?: { code?: string } }).data?.code === "UNAUTHORIZED")
        void renew();
    });
    // Decode only to schedule refresh; the backend validates the token.
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")),
      ) as { exp?: number };
      if (payload.exp)
        timer = setTimeout(
          () => void renew(),
          Math.max(0, payload.exp * 1000 - Date.now() - 30000),
        );
    } catch {
      setError("Tracking session could not be read. Sign in again.");
    }
    return () => {
      disposed = true;
      clearTimeout(timer);
      connection.removeAllListeners();
      connection.disconnect();
      setSocket(null);
      setConnected(false);
      setError("");
    };
  }, [enabled, token, account, attempt]);
  return { socket, connected, error, retry: () => setAttempt((n) => n + 1) };
}

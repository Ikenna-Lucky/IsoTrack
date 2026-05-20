"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface LocationUpdate {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: number;
}

interface UseSocketOptions {
  trackingId: string | null;
  onLocation?: (update: LocationUpdate) => void;
}

export function useSocket({ trackingId, onLocation }: UseSocketOptions) {
  const socketRef     = useRef<Socket | null>(null);
  const onLocationRef = useRef(onLocation);
  const [connected, setConnected] = useState(false);

  // Keep callback ref fresh without re-running effects
  useEffect(() => {
    onLocationRef.current = onLocation;
  });

  // ── Effect 1: socket lifecycle — created once, destroyed on unmount ─────────
  // We start with "polling" (HTTP long-poll) rather than "websocket".
  // React StrictMode mounts → unmounts → remounts every component in dev.
  // If we start with WebSocket, the handshake is in-flight when StrictMode
  // fires the first cleanup and calls socket.disconnect() — producing:
  //   "WebSocket is closed before the connection is established."
  // HTTP polling requests can be cancelled cleanly without this warning.
  // Socket.io automatically upgrades polling → WebSocket once the initial
  // HTTP connection is stable, so there is no real-world performance cost.
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("driver:location", (data: LocationUpdate) => {
      onLocationRef.current?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ── Effect 2: join / leave rooms when trackingId changes ───────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !trackingId) return;

    const join = () => socket.emit("shipment:join", trackingId);

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    return () => {
      socket.emit("shipment:leave", trackingId);
      socket.off("connect", join);
    };
  }, [trackingId]);

  const emitLocation = (
    payload: Omit<LocationUpdate, "timestamp"> & { trackingId: string },
  ) => {
    socketRef.current?.emit("driver:location", {
      ...payload,
      timestamp: Date.now(),
    });
  };

  return { connected, emitLocation };
}

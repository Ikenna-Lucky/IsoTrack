"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    if (trackingId) {
      socket.emit("shipment:join", trackingId);
    }

    socket.on("driver:location", (data: LocationUpdate) => {
      onLocation?.(data);
    });

    return () => {
      if (trackingId) socket.emit("shipment:leave", trackingId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [trackingId]);

  const emitLocation = (payload: Omit<LocationUpdate, "timestamp"> & { trackingId: string }) => {
    socketRef.current?.emit("driver:location", {
      ...payload,
      timestamp: Date.now(),
    });
  };

  return { connected, emitLocation };
}

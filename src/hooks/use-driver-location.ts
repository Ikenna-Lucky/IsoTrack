"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// How often (ms) to emit even if the position has not changed
const EMIT_INTERVAL_MS = 5_000;
// Minimum metres moved before we emit immediately
const MIN_DISTANCE_M = 10;

function haversineMetres(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DriverPosition {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
}

interface UseDriverLocationOptions {
  trackingIds: string[];
  enabled?: boolean | undefined;
}

interface UseDriverLocationResult {
  broadcasting: boolean;
  position: DriverPosition | null;
  error: string;
}

export function useDriverLocation({
  trackingIds,
  enabled = true,
}: UseDriverLocationOptions): UseDriverLocationResult {
  const [position, setPosition]         = useState<DriverPosition | null>(null);
  const [error, setError]               = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const socketRef      = useRef<Socket | null>(null);
  const lastPos        = useRef<DriverPosition | null>(null);
  const lastEmitAt     = useRef<number>(0);
  const watchId        = useRef<number | null>(null);
  const trackingIdsRef = useRef<string[]>(trackingIds);

  // Sync ref on every render so emitPosition always reads the latest list
  useEffect(() => {
    trackingIdsRef.current = trackingIds;
  });

  const active = enabled && trackingIds.length > 0;

  useEffect(() => {
    if (!active) {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      socketRef.current?.disconnect();
      socketRef.current = null;
      setBroadcasting(false);
      return;
    }

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    // polling-first avoids "WebSocket closed before established" in StrictMode.
    // See use-socket.ts for the full explanation.
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect",    () => setBroadcasting(true));
    socket.on("disconnect", () => setBroadcasting(false));

    function emitPosition(pos: DriverPosition) {
      if (!socketRef.current) return;
      for (const tid of trackingIdsRef.current) {
        socketRef.current.emit("driver:location", {
          trackingId: tid,
          lat:       pos.lat,
          lng:       pos.lng,
          heading:   pos.heading,
          speed:     pos.speed,
          timestamp: Date.now(),
        });
      }
      lastEmitAt.current = Date.now();
    }

    watchId.current = navigator.geolocation.watchPosition(
      (geo) => {
        const pos: DriverPosition = {
          lat:     geo.coords.latitude,
          lng:     geo.coords.longitude,
          heading: geo.coords.heading ?? 0,
          speed:   geo.coords.speed   ?? 0,
        };

        setPosition(pos);
        setError("");

        const prev = lastPos.current;
        const movedEnough =
          !prev ||
          haversineMetres(prev.lat, prev.lng, pos.lat, pos.lng) >= MIN_DISTANCE_M;
        const heartbeatDue = Date.now() - lastEmitAt.current >= EMIT_INTERVAL_MS;

        if (movedEnough || heartbeatDue) {
          emitPosition(pos);
          lastPos.current = pos;
        }
      },
      (geoError) => {
        const msgs: Record<number, string> = {
          1: "Location access denied. Please enable it in your browser settings.",
          2: "Your location could not be determined. Check your GPS signal.",
          3: "Location request timed out. Please try again.",
        };
        setError(msgs[geoError.code] ?? "An unknown location error occurred.");
        setBroadcasting(false);
      },
      { enableHighAccuracy: true, maximumAge: 3_000, timeout: 15_000 },
    );

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      socket.disconnect();
      socketRef.current = null;
      setBroadcasting(false);
    };
  }, [active]);

  return { broadcasting, position, error };
}

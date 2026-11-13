"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { locationIsFresh, type LocationUpdate } from "@/lib/live-tracking";
import { useTrackingConnection } from "./use-tracking-connection";
import { publishDriverLocation } from "@/lib/publish-driver-location";
export function useDriverLocation({
  trackingIds,
  enabled = false,
}: {
  trackingIds: string[];
  enabled?: boolean;
}) {
  const connection = useTrackingConnection(enabled && trackingIds.length > 0);
  const ids = useRef(trackingIds);
  useEffect(() => {
    ids.current = trackingIds;
  }, [trackingIds]);
  const [position, setPosition] = useState<Omit<LocationUpdate, "trackingId"> | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [error, setError] = useState("");
  const [profileSavedAt, setProfileSavedAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const account = useRef(0);
  useEffect(() => {
    const generation = ++account.current;
    setBroadcasting(false);
    setPosition(null);
    setError("");
    setProfileSavedAt(null);
    if (!enabled) return;
    if (!navigator.geolocation) {
      setError("This browser does not support location sharing.");
      return;
    }
    let disposed = false,
      sending = false,
      profileAt = 0;
    let sample: Omit<LocationUpdate, "trackingId"> | null = null;
    const published = new Map<string, number>();
    let cursor = 0;
    const controller = new AbortController();
    const watch = navigator.geolocation.watchPosition(
      (fix) => {
        if (disposed) return;
        sample = {
          lat: fix.coords.latitude,
          lng: fix.coords.longitude,
          timestamp: fix.timestamp,
          ...(fix.coords.heading != null && fix.coords.heading >= 0 && fix.coords.heading < 360
            ? { heading: fix.coords.heading }
            : {}),
          ...(fix.coords.speed != null && fix.coords.speed >= 0 && fix.coords.speed <= 100
            ? { speed: fix.coords.speed }
            : {}),
        };
        setPosition(sample);
      },
      (cause) => {
        if (disposed) return;
        sample = null;
        setPosition(null);
        setBroadcasting(false);
        setError(
          cause.code === 1
            ? "Location permission denied. Enable it in browser settings, then retry."
            : "GPS position unavailable. Check your signal and retry.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    async function send() {
      if (disposed || sending) return;
      if (!sample || !locationIsFresh(sample.timestamp)) {
        setBroadcasting(false);
        return;
      }
      const current = sample;
      sending = true;
      try {
        if (Date.now() - profileAt >= 30000) {
          await api.patch(
            "/drivers/me/location",
            { lat: current.lat, lng: current.lng },
            { signal: controller.signal },
          );
          if (disposed) return;
          profileAt = Date.now();
          setProfileSavedAt(profileAt);
        }
        const all = [...new Set(ids.current)];
        cursor = all.length ? cursor % all.length : 0;
        const batch = [...all.slice(cursor), ...all.slice(0, cursor)].slice(0, 10);
        cursor += batch.length;
        const result = connection.socket
          ? await publishDriverLocation(
              connection.socket,
              batch,
              current,
              published,
              () => !disposed && sample !== null && generation === account.current,
            )
          : { accepted: 0, rejected: 0 };
        if (!disposed) {
          setBroadcasting(
            sample !== null && all.some((id) => locationIsFresh(published.get(id) ?? 0)),
          );
          setError(
            result.rejected
              ? "Some shipment positions were not confirmed. Refresh your deliveries and retry; accepted shipments may still receive updates."
              : "",
          );
        }
      } catch (cause) {
        if (!disposed) {
          setBroadcasting(false);
          setError(
            cause instanceof Error ? cause.message : "Could not confirm location sharing. Retry.",
          );
        }
      } finally {
        sending = false;
      }
    }
    const timer = setInterval(() => void send(), 5000);
    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
      navigator.geolocation.clearWatch(watch);
    };
  }, [enabled, connection.socket, attempt]);
  return {
    position,
    broadcasting: connection.connected && broadcasting,
    error: error || connection.error,
    profileSavedAt,
    retry: () => {
      setAttempt((n) => n + 1);
      connection.retry();
    },
  };
}

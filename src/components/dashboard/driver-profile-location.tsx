"use client";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";
import { workspaceButton, workspacePanel } from "./workspace-ui";
export function DriverProfileLocation() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const alive = useRef(false);
  const request = useRef<AbortController | null>(null);
  const cache = useQueryClient();
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
    };
  }, []);
  function update() {
    if (pending) return;
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Location is unavailable in this browser.");
      return;
    }
    setPending(true);
    navigator.geolocation.getCurrentPosition(
      (fix) => {
        if (!alive.current) return;
        const controller = new AbortController();
        request.current = controller;
        void api
          .patch(
            "/drivers/me/location",
            { lat: fix.coords.latitude, lng: fix.coords.longitude },
            { signal: controller.signal },
          )
          .then(() => {
            if (alive.current) {
              setMessage("Profile location updated. This does not start shipment tracking.");
              void cache.invalidateQueries({ queryKey: ["drivers"] });
            }
          })
          .catch((cause) => {
            if (alive.current)
              setMessage(
                extractErrorMessage(cause, "Could not confirm the location update. Retry."),
              );
          })
          .finally(() => {
            if (alive.current) setPending(false);
          });
      },
      (cause) => {
        if (!alive.current) return;
        setPending(false);
        setMessage(
          cause.code === 1
            ? "Location permission denied. Enable it in browser settings and retry."
            : "Could not obtain a GPS position. Check your signal and retry.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }
  return (
    <section className={workspacePanel + " space-y-4 p-5"}>
      <h2 className="text-lg font-semibold">Profile location</h2>
      <p className="text-sm leading-6 text-[var(--landing-muted)]">
        Save your current GPS position to your driver profile. This shares your position with the
        business that manages your fleet. For shipment tracking, enable location sharing on
        Deliveries and keep that page open.
      </p>
      <button disabled={pending} className={workspaceButton} onClick={update}>
        {pending ? "Updating position..." : "Update profile location"}
      </button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}

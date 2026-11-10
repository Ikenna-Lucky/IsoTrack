"use client";

import { useParams } from "next/navigation";
import LiveTrackingPage from "@/components/tracking/live-tracking-page";
import { SampleTrackingPage } from "@/components/tracking/sample-tracking-page";
import "../../landing-theme.css";

export default function PublicTrackingPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  return trackingId.toUpperCase() === "IST-K7X2M9PQ" ? (
    <SampleTrackingPage />
  ) : (
    <LiveTrackingPage key={trackingId} />
  );
}

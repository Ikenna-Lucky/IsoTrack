"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";
import { stripeCheckoutUrl } from "@/lib/checkout-url";

export function usePayment() {
  const [error, setError] = useState("");
  const initialize = useMutation({
    mutationFn: async ({ shipmentId }: { shipmentId: string }) => {
      const response = await api.post<{ data: { authorizationUrl: string } }>("/payments/initialize", { shipmentId });
      return stripeCheckoutUrl(response.data.data.authorizationUrl);
    },
    onSuccess: (url) => { setError(""); window.location.assign(url); },
    onError: (cause: unknown) => setError(extractErrorMessage(cause, "Could not open Stripe Checkout.")),
  });
  return { pay: initialize.mutate, isPaying: initialize.isPending, error, clearError: () => setError("") };
}

export function usePaymentReturn() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  useEffect(() => {
    const url = new URL(window.location.href);
    const reference = url.searchParams.get("payment_reference");
    if (url.searchParams.get("payment_cancelled") === "1") setMessage("Checkout cancelled. Your shipment is still unpaid unless a payment is confirmed.");
    if (!reference || !/^IST-PAY-[A-Za-z0-9_-]{24}$/.test(reference)) return;
    const controller = new AbortController();
    setMessage("Confirming your payment…");
    void api.get<{ data: { paid: boolean } }>(`/payments/verify/${encodeURIComponent(reference)}`, { signal: controller.signal })
      .then(async (response) => {
        if (controller.signal.aborted) return;
        if (response.data.data.paid) {
          setMessage("Payment confirmed.");
          await queryClient.invalidateQueries({ queryKey: ["shipments"] });
          url.searchParams.delete("payment_reference");
          window.history.replaceState(null, "", url.pathname + url.search);
        } else setMessage("Payment is not confirmed yet. Refresh this page to check again.");
      }).catch((cause: unknown) => {
        if (!controller.signal.aborted) setMessage(extractErrorMessage(cause, "Could not confirm payment. Refresh to try again."));
      });
    return () => controller.abort();
  }, [queryClient]);
  return message;
}

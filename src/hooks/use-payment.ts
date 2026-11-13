"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkflowRequest } from "./use-workflow-request";
import {
  initializeCustomerCheckout,
  checkoutFailureIsUncertain,
  verificationSchema,
  type CheckoutRequest,
} from "@/lib/customer-payment";
import { stripeCheckoutUrl } from "@/lib/checkout-url";
import { extractErrorMessage } from "@/lib/errors";
export function useCheckout(shipmentId: string) {
  const [request, setRequest] = useWorkflowRequest<CheckoutRequest>("checkout", shipmentId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function open() {
    if (busy) return;
    const current = request ?? { key: crypto.randomUUID(), body: { shipmentId } };
    if (!request && !setRequest(current)) {
      setError("Another action is pending for this shipment.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!current.checkout) {
        const checkout = await initializeCustomerCheckout(api, current);
        stripeCheckoutUrl(checkout.authorizationUrl);
        // Keep returned recovery metadata on the original account-scoped request.
        current.checkout = checkout;
      }
      window.location.assign(stripeCheckoutUrl(current.checkout.authorizationUrl));
    } catch (cause) {
      if (!checkoutFailureIsUncertain(cause) && !current.checkout) setRequest(null, current);
      setError(
        extractErrorMessage(
          cause,
          "Checkout could not be confirmed. Retry the original request; do not start a second payment.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return { request, busy, error, open, release: () => request && setRequest(null, request) };
}
export function usePaymentReference(reference: string) {
  return useQuery({
    queryKey: ["payments", "verify", reference],
    enabled: !!reference,
    retry: false,
    queryFn: async ({ signal }) => {
      const value = verificationSchema.parse(
        (
          await api.get<{ data: unknown }>(`/payments/verify/${encodeURIComponent(reference)}`, {
            signal,
          })
        ).data.data,
      );
      if (value.reference !== reference) throw new Error("Payment reference mismatch");
      return value;
    },
  });
}

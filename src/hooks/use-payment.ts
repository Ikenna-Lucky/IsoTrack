"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/errors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InitializeResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
}

interface VerifyResponse {
  paid: boolean;
  channel?: string;
  status?: string;
  reference: string;
}

// Paystack inline popup type (loaded from CDN)
declare global {
  interface Window {
    PaystackPop?: {
      setup(opts: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }): { openIframe(): void };
    };
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePaymentOptions {
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export function usePayment({ onSuccess, onClose }: UsePaymentOptions = {}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Step 2: verify with our backend after popup closes
  const verify = useCallback(
    async (reference: string) => {
      setVerifying(true);
      try {
        const res = await api.get<{ data: VerifyResponse }>(
          `/payments/verify/${reference}`,
        );
        const result = res.data.data;
        if (result.paid) {
          // Invalidate shipments so the list refreshes with isPaid = true
          await queryClient.invalidateQueries({ queryKey: ["shipments"] });
          onSuccess?.(reference);
        }
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "Payment verification failed."));
      } finally {
        setVerifying(false);
      }
    },
    [queryClient, onSuccess],
  );

  // Step 1: initialize with backend → open Paystack popup
  const initMutation = useMutation({
    mutationFn: async ({
      shipmentId,
      email,
    }: {
      shipmentId: string;
      email: string;
    }) => {
      const res = await api.post<{ data: InitializeResponse }>(
        "/payments/initialize",
        { shipmentId },
      );
      return { ...res.data.data, email };
    },
    onSuccess: (data) => {
      setError("");

      const publicKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

      // Load Paystack inline script once if not already present
      if (!window.PaystackPop) {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.onload = () => openPopup(data, publicKey);
        document.head.appendChild(script);
      } else {
        openPopup(data, publicKey);
      }
    },
    onError: (err: unknown) => {
      setError(extractErrorMessage(err, "Could not initialise payment."));
    },
  });

  function openPopup(
    data: InitializeResponse & { email: string },
    publicKey: string,
  ) {
    const handler = window.PaystackPop!.setup({
      key: publicKey,
      email: data.email,
      amount: data.amountKobo,
      ref: data.reference,
      onClose: () => {
        onClose?.();
      },
      callback: (response) => {
        void verify(response.reference);
      },
    });
    handler.openIframe();
  }

  return {
    pay: initMutation.mutate,
    isPaying: initMutation.isPending,
    verifying,
    error,
    clearError: () => setError(""),
  };
}

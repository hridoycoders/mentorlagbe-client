"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    checkoutUrl: string;
  };
}

// Module-level guard: prevents overlapping checkout requests even when
// separate components each hold their own instance of this hook.
let checkoutInFlight = false;

/**
 * Creates a Stripe Checkout Session through the existing backend API and
 * redirects the browser to the returned Stripe Checkout URL.
 *
 * The backend derives the plan from the authenticated user's role
 * (tutor => $15, student => $10), so no plan information is sent in the body.
 */
export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const startCheckout = useCallback(async () => {
    if (checkoutInFlight) return;

    checkoutInFlight = true;
    setIsProcessing(true);

    try {
      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again.",
        );
      }

      const response = await apiRequest<CheckoutSessionResponse>(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        },
      );

      if (!response.success || !response.data?.checkoutUrl) {
        throw new Error(
          response.message || "Could not start checkout. Please try again.",
        );
      }

      toast.success("Redirecting to secure Stripe Checkout...");
      window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.";

      toast.error(message);
    } finally {
      checkoutInFlight = false;
      if (mounted.current) setIsProcessing(false);
    }
  }, []);

  return { startCheckout, isProcessing };
}

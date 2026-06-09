"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ConfirmInvoicePaymentSideEffectsProps {
  sessionId: string;
}

/**
 * Filet de sécurité : confirme notification + email dans une requête API dédiée,
 * hors rendu RSC (évite l'interruption par revalidatePath / after()).
 */
export function ConfirmInvoicePaymentSideEffects({
  sessionId,
}: ConfirmInvoicePaymentSideEffectsProps) {
  const router = useRouter();
  const firedRef = useRef(false);

  useEffect(() => {
    const trimmed = sessionId.trim();
    if (!trimmed || firedRef.current) return;
    firedRef.current = true;

    void (async () => {
      try {
        const response = await fetch("/api/public/payment/confirm-side-effects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: trimmed }),
        });

        if (response.ok) {
          router.refresh();
        }
      } catch {
        // Silencieux — la sync serveur ou un refresh ultérieur peut rattraper.
      }
    })();
  }, [sessionId, router]);

  return null;
}

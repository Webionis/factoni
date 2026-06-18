"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BillingCheckoutNoticeProps {
  status?: string;
}

export function BillingCheckoutNotice({ status }: BillingCheckoutNoticeProps) {
  const router = useRouter();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!status || handledRef.current === status) return;
    handledRef.current = status;

    if (status === "success") {
      toast.success("Abonnement activé — merci pour votre confiance !");
    } else if (status === "pending") {
      toast.message(
        "Paiement reçu. Votre abonnement sera activé dans quelques instants.",
      );
    } else if (status === "cancelled") {
      toast.message("Paiement annulé — aucun changement n'a été effectué.");
    } else if (status === "portal") {
      toast.message("Abonnement mis à jour.");
    } else if (status === "scheduled") {
      toast.success(
        "Changement d'abonnement enregistré. Consultez le détail dans votre offre actuelle.",
        { duration: 6000 },
      );
    }

    router.replace("/settings/billing");
  }, [router, status]);

  return null;
}

"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PayQuoteDepositButtonProps {
  token: string;
  amountLabel: string;
  className?: string;
}

export function PayQuoteDepositButton({
  token,
  amountLabel,
  className,
}: PayQuoteDepositButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Impossible d'ouvrir le paiement.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Impossible d'ouvrir le paiement. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={() => void handlePay()}
      disabled={loading}
      className={cn(
        "h-12 w-full gap-2 bg-[#635bff] text-base font-semibold text-white shadow-[0_4px_14px_rgba(99,91,255,0.35)] hover:bg-[#5851ea] sm:w-auto sm:min-w-[220px]",
        className,
      )}
    >
      {loading ? "Redirection…" : `Payer l'acompte · ${amountLabel}`}
    </Button>
  );
}

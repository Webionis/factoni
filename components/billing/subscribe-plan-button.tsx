"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { BillingCheckoutPlan } from "@/lib/billing/stripe/config";
import { PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

interface SubscribePlanButtonProps {
  plan: BillingCheckoutPlan;
  label: string;
  variant?: "default" | "outline";
  disabled?: boolean;
  className?: string;
}

export function SubscribePlanButton({
  plan,
  label,
  variant = "default",
  disabled = false,
  className,
}: SubscribePlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
        upgraded?: boolean;
        plan?: BillingCheckoutPlan;
        paymentRequired?: boolean;
      };

      if (response.ok && data.upgraded) {
        const planName = data.plan
          ? PLAN_DISPLAY_NAMES[data.plan]
          : PLAN_DISPLAY_NAMES[plan];
        toast.success(`Vous êtes passé à l'offre ${planName}.`);
        window.location.href = "/settings/billing?checkout=success";
        return;
      }

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Impossible de démarrer le paiement.");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("w-full", className)}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading ? "Mise à jour…" : label}
    </Button>
  );
}

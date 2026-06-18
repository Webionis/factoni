"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatBillingDateLabel } from "@/lib/billing/format-billing-date";
import { getScheduledDowngradeToast } from "@/lib/billing/plan-messaging";
import type { BillingCheckoutPlan } from "@/lib/billing/stripe/config";
import { isPaidPlan } from "@/lib/billing/stripe/plan-utils";
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
        scheduled?: boolean;
        effectiveAt?: string;
        plan?: BillingCheckoutPlan;
        currentPlan?: BillingCheckoutPlan;
        paymentRequired?: boolean;
      };

      if (response.ok && data.scheduled && data.effectiveAt) {
        const targetPlan = data.plan ?? plan;
        const currentPlan =
          data.currentPlan && isPaidPlan(data.currentPlan)
            ? data.currentPlan
            : targetPlan === "starter"
              ? "pro"
              : "starter";
        const effectiveDateLabel = formatBillingDateLabel(data.effectiveAt);

        toast.success(
          getScheduledDowngradeToast({
            currentPlan,
            targetPlan,
            effectiveDateLabel,
          }),
          { duration: 8000 },
        );
        window.location.href = "/settings/billing";
        return;
      }

      if (response.ok && data.upgraded) {
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
      {isLoading ? "Enregistrement…" : label}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ManageBillingButtonProps {
  className?: string;
  variant?: "default" | "outline";
}

export function ManageBillingButton({
  className,
  variant = "outline",
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Impossible d'ouvrir le portail client.");
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
      className={cn(className)}
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? "Ouverture…" : "Gérer l'abonnement"}
    </Button>
  );
}

"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { getFeatureDeniedMessage, getFeatureUpgradeLabel } from "@/lib/billing/feature-messages";
import type { FeatureKey } from "@/lib/billing/types";
import { buttonVariants } from "@/components/ui/button";
import { surfaceCardClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface UpgradePlanPromptProps {
  feature: FeatureKey;
  className?: string;
  compact?: boolean;
}

export function UpgradePlanPrompt({
  feature,
  className,
  compact = false,
}: UpgradePlanPromptProps) {
  const message = getFeatureDeniedMessage(feature);
  const upgradeLabel = getFeatureUpgradeLabel(feature);

  if (compact) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {message}{" "}
        <Link
          href="/settings/billing"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {upgradeLabel}
        </Link>
      </p>
    );
  }

  return (
    <div
      className={cn(
        surfaceCardClassName,
        "flex flex-col gap-4 border border-dashed p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Lock
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Fonctionnalité Pro
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      <Link
        href="/settings/billing"
        className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full sm:w-auto")}
      >
        Voir les offres
      </Link>
    </div>
  );
}

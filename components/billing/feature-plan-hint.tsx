"use client";

import Link from "next/link";

import {
  useHasFeature,
  useSubscriptionAccess,
} from "@/components/billing/subscription-provider";
import {
  getFeatureDeniedMessage,
  getFeatureUpgradeLabel,
} from "@/lib/billing/feature-messages";
import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import { FEATURE_MIN_PLAN } from "@/lib/billing/features";
import type { FeatureKey } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

type FeaturePlanHintVariant = "beta-offered" | "future-plan";

interface FeaturePlanHintProps {
  feature: FeatureKey;
  /** Offre de lancement : message généreux. Après : plan cible. */
  variant?: FeaturePlanHintVariant;
  className?: string;
}

export function FeaturePlanHint({
  feature,
  variant = "beta-offered",
  className,
}: FeaturePlanHintProps) {
  const hasAccess = useHasFeature(feature);
  const { isBeta } = useSubscriptionAccess();
  const minPlan = FEATURE_MIN_PLAN[feature];
  const planName = PLAN_DISPLAY_NAMES[minPlan];

  if (!hasAccess) {
    return (
      <p
        className={cn(
          "text-xs font-medium leading-relaxed text-[#94a3b8]",
          className,
        )}
      >
        {getFeatureDeniedMessage(feature)}{" "}
        <Link
          href="/settings/billing"
          className="text-[#2563eb] underline-offset-4 hover:underline dark:text-[#93c5fd]"
        >
          {getFeatureUpgradeLabel(feature)}
        </Link>
      </p>
    );
  }

  if (!isBeta && variant === "future-plan") {
    return null;
  }

  const message =
    variant === "beta-offered"
      ? `Inclus dans l'${LAUNCH_OFFER.name.toLowerCase()}`
      : `Disponible dans ${planName}`;

  return (
    <p
      className={cn(
        "text-xs font-medium text-[#94a3b8]",
        variant === "beta-offered" && "text-[#64748b]",
        className,
      )}
    >
      {message}
    </p>
  );
}

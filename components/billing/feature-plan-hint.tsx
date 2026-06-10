import { FEATURE_MIN_PLAN } from "@/lib/billing/features";
import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
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
  const minPlan = FEATURE_MIN_PLAN[feature];
  const planName = PLAN_DISPLAY_NAMES[minPlan];

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

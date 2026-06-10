import { FeatureList } from "@/components/billing/feature-list";
import { Button } from "@/components/ui/button";
import type { BillingPlanCardConfig } from "@/lib/billing/plans";
import type { SubscriptionPlan } from "@/lib/billing/types";
import {
  premiumShadowClassName,
  premiumShadowHoverClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export interface PricingCardProps extends BillingPlanCardConfig {
  /** Plan actif de l'utilisateur (futur : surbrillance « votre offre ») */
  currentPlan?: SubscriptionPlan;
}

export function PricingCard({
  id,
  tierBadge,
  name,
  description,
  features,
  price,
  ctaLabel,
  ctaFootnote,
  highlighted,
  disabled = true,
  currentPlan,
}: PricingCardProps) {
  const isCurrent = currentPlan === id;

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border bg-white p-6 sm:p-7 dark:bg-[rgba(30,41,59,0.72)]",
        highlighted
          ? "border-[rgba(37,99,235,0.18)] shadow-[0_4px_12px_rgba(15,23,42,0.04),0_24px_56px_rgba(37,99,235,0.08)] ring-1 ring-[rgba(37,99,235,0.06)] dark:border-[rgba(96,165,250,0.25)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_24px_56px_rgba(37,99,235,0.12)] dark:ring-[rgba(96,165,250,0.12)]"
          : "border-[rgba(15,23,42,0.06)] dark:border-[rgba(148,163,184,0.14)]",
        !highlighted && premiumShadowClassName,
        !disabled &&
          !highlighted &&
          transitionPremiumClassName &&
          premiumShadowHoverClassName,
        isCurrent && "ring-2 ring-[#2563eb]/20",
      )}
      aria-labelledby={`pricing-card-${id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
            highlighted
              ? "bg-[rgba(37,99,235,0.08)] text-[#2563eb] dark:bg-[rgba(37,99,235,0.15)] dark:text-[#60a5fa]"
              : "border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] text-[#64748b] dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(30,41,59,0.6)] dark:text-[#94a3b8]",
          )}
        >
          {tierBadge}
        </span>
        {isCurrent ? (
          <span className="inline-flex rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-[10px] font-semibold text-[#15803d] dark:bg-emerald-500/15 dark:text-emerald-400">
            Votre offre
          </span>
        ) : null}
      </div>

      <h3
        id={`pricing-card-${id}`}
        className="mt-4 text-lg font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]"
      >
        {name}
      </h3>
      <p className="mt-1 text-sm text-[#64748b] dark:text-[#94a3b8]">{description}</p>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
        {price}
      </p>

      <FeatureList features={features} className="mt-6 flex-1" />

      <div className="mt-5 w-full min-w-0">
        <Button
          type="button"
          variant={highlighted ? "default" : "outline"}
          className={cn(
            "w-full",
            disabled && "cursor-not-allowed opacity-50",
          )}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {ctaLabel}
        </Button>
        {ctaFootnote ? (
          <p className="mt-3 text-xs leading-relaxed text-[#94a3b8] dark:text-[#64748b]">
            {ctaFootnote}
          </p>
        ) : null}
      </div>
    </article>
  );
}

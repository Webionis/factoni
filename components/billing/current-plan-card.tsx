import { CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { PlanBadge } from "@/components/billing/plan-badge";
import { formatBillingDateLabel } from "@/lib/billing/format-billing-date";
import { getScheduledDowngradeMessage } from "@/lib/billing/plan-messaging";
import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { SubscriptionPlan } from "@/lib/billing/types";
import {
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
  surfaceInsetClassName,
  surfaceInsetEmphasisClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const LAUNCH_BENEFITS = [
  LAUNCH_OFFER.foundersPro,
  "Toutes les fonctionnalités débloquées",
  "Aucun paiement requis pendant l'offre de lancement",
] as const;

interface CurrentPlanCardProps {
  className?: string;
  billingPortalEnabled?: boolean;
  stripeCustomerId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  pendingPlan?: SubscriptionPlan | null;
  pendingPlanEffectiveAt?: string | null;
  plan: SubscriptionPlan;
  isActive: boolean;
  isBeta: boolean;
}

export function CurrentPlanCard({
  className,
  billingPortalEnabled = false,
  stripeCustomerId,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
  pendingPlan = null,
  pendingPlanEffectiveAt = null,
  plan,
  isActive,
  isBeta,
}: CurrentPlanCardProps) {
  const isLaunchOffer = isBeta;
  const isPaidPlan = plan === "starter" || plan === "pro";
  const hasPendingPlanChange =
    pendingPlan != null &&
    pendingPlan !== plan &&
    (pendingPlan === "starter" || pendingPlan === "pro");
  const showPortal =
    billingPortalEnabled && Boolean(stripeCustomerId?.trim());

  function renderPeriodLine(): ReactNode {
    if (!isPaidPlan || !currentPeriodEnd) return null;

    const formattedDate = formatBillingDateLabel(currentPeriodEnd);

    if (cancelAtPeriodEnd) {
      return (
        <>
          {" "}
          Annulation le{" "}
          <span className="font-medium text-[#b45309] dark:text-[#fbbf24]">
            {formattedDate}
          </span>
          .
        </>
      );
    }

    if (hasPendingPlanChange) {
      const pendingDate = pendingPlanEffectiveAt
        ? formatBillingDateLabel(pendingPlanEffectiveAt)
        : formattedDate;

      return (
        <>
          {" "}
          Changement vers {PLAN_DISPLAY_NAMES[pendingPlan]} le{" "}
          <span className="font-medium text-[#b45309] dark:text-[#fbbf24]">
            {pendingDate}
          </span>
          .
        </>
      );
    }

    return (
      <>
        {" "}
        Renouvellement le{" "}
        <span className="font-medium text-[#0f172a] dark:text-[#f8fafc]">
          {formattedDate}
        </span>
        .
      </>
    );
  }

  return (
    <section
      className={cn(
        surfaceCardClassName,
        "relative overflow-hidden p-6 sm:p-8",
        className,
      )}
      aria-labelledby="current-plan-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(37,99,235,0.2)] to-transparent"
        aria-hidden
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="current-plan-heading"
            className={sectionHeadingClassName}
          >
            Votre offre actuelle
          </h2>
          {isLaunchOffer ? (
            <p className={cn("mt-3 max-w-xl text-[15px] leading-relaxed", formSectionDescriptionClassName)}>
              Vous profitez de l&apos;{LAUNCH_OFFER.name.toLowerCase()} avec
              l&apos;ensemble des fonctionnalités Pro.
            </p>
          ) : (
            <p className={cn("mt-3 text-[15px]", formSectionDescriptionClassName)}>
              Offre {PLAN_DISPLAY_NAMES[plan]} —{" "}
              {cancelAtPeriodEnd
                ? "active jusqu'à la fin de la période"
                : hasPendingPlanChange
                  ? `active jusqu'au changement prévu`
                  : isActive
                    ? "active"
                    : "inactive"}
              .
              {renderPeriodLine()}
            </p>
          )}
        </div>
        <PlanBadge plan={plan} />
      </div>

      {hasPendingPlanChange && pendingPlanEffectiveAt && isPaidPlan ? (
        <div
          className={cn(
            "mt-5 flex gap-3 px-4 py-3.5",
            surfaceInsetClassName,
            "border-[rgba(180,83,9,0.18)] bg-[rgba(255,251,235,0.9)] dark:border-[rgba(251,191,36,0.2)] dark:bg-[rgba(120,53,15,0.18)]",
          )}
          role="status"
        >
          <Info
            className="mt-0.5 size-4 shrink-0 text-[#b45309] dark:text-[#fbbf24]"
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-[#92400e] dark:text-[#fde68a]">
            {getScheduledDowngradeMessage({
              currentPlan: plan,
              targetPlan: pendingPlan,
              effectiveDateLabel: formatBillingDateLabel(pendingPlanEffectiveAt),
            })}
          </p>
        </div>
      ) : null}

      {showPortal ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ManageBillingButton />
        </div>
      ) : null}

      {isLaunchOffer ? (
        <>
          <p className={cn("mt-5 px-4 py-3.5", surfaceInsetClassName)}>
            {LAUNCH_OFFER.foundersPro}.{" "}
            <span className={surfaceInsetEmphasisClassName}>Starter (19 €/mois)</span>{" "}
            et{" "}
            <span className={surfaceInsetEmphasisClassName}>Pro (39 €/mois)</span>{" "}
            s&apos;appliqueront après l&apos;offre de lancement.
          </p>

          <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {LAUNCH_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className={cn("flex items-center gap-2 text-sm font-medium", formSectionDescriptionClassName)}
              >
                <CheckCircle2
                  className="size-4 shrink-0 text-[#2563eb] dark:text-[#60a5fa]"
                  aria-hidden
                />
                {benefit}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

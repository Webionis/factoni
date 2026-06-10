import { CheckCircle2 } from "lucide-react";

import { PlanBadge } from "@/components/billing/plan-badge";
import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { SubscriptionAccess } from "@/lib/billing/types";
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
  access: SubscriptionAccess;
  className?: string;
}

export function CurrentPlanCard({ access, className }: CurrentPlanCardProps) {
  const isLaunchOffer = access.isBeta;

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
              Offre {PLAN_DISPLAY_NAMES[access.plan]} —{" "}
              {access.isActive ? "active" : "inactive"}.
            </p>
          )}
        </div>
        <PlanBadge plan={access.plan} />
      </div>

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

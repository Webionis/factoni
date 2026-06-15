import Link from "next/link";

import { PlanBadge } from "@/components/billing/plan-badge";
import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { SubscriptionAccess } from "@/lib/billing/types";
import {
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
  surfaceInsetClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface PlanSummaryCardProps {
  access: SubscriptionAccess;
  className?: string;
}

export function PlanSummaryCard({ access, className }: PlanSummaryCardProps) {
  return (
    <section
      className={cn(surfaceCardClassName, "p-4 sm:p-5", className)}
      aria-labelledby="plan-summary-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="plan-summary-heading"
            className={cn("text-sm font-semibold", sectionHeadingClassName)}
          >
            Votre offre
          </h2>
          <p className={cn("mt-1 text-sm", formSectionDescriptionClassName)}>
            {access.isBeta
              ? `${LAUNCH_OFFER.foundersPro} — ${LAUNCH_OFFER.earlyAccess.toLowerCase()}.`
              : `Offre ${PLAN_DISPLAY_NAMES[access.plan]}`}
          </p>
        </div>
        <PlanBadge plan={access.plan} />
      </div>

      {access.isBeta ? (
        <p className={cn("mt-4 px-4 py-3", surfaceInsetClassName)}>
          Toutes les fonctionnalités sont débloquées — factures, clients, logo,
          exports et outils avancés inclus. Starter 19 €/mois · Pro 39 €/mois
          après l&apos;offre de lancement.
        </p>
      ) : null}

      <p className="mt-4 text-xs text-[#94a3b8] dark:text-[#64748b]">
        <Link href="/settings/billing" className="font-medium text-[#2563eb] hover:underline dark:text-[#60a5fa]">
          Voir les offres
        </Link>
        {" · "}
        {LAUNCH_OFFER.noCardRequired}
      </p>
    </section>
  );
}

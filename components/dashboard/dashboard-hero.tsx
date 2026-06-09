"use client";

import { PlanBadge } from "@/components/billing/plan-badge";
import { useSubscriptionAccess } from "@/components/billing/subscription-provider";

interface DashboardHeroProps {
  /** Nom d'affichage (raison sociale ou identifiant court). */
  title: string;
}

export function DashboardHero({ title }: DashboardHeroProps) {
  const { plan } = useSubscriptionAccess();

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#0f172a] dark:text-[#f8fafc] sm:text-[1.625rem] sm:leading-[1.25]">
            {title}
          </h1>
          <PlanBadge
            plan={plan}
            className="translate-y-px px-2 py-0 text-[10px] font-medium tracking-wide opacity-90"
          />
        </div>
        <p className="max-w-md text-sm leading-snug text-[#64748b] dark:text-[#94a3b8]">
          Vue d&apos;ensemble de votre activité.
        </p>
      </div>
    </header>
  );
}

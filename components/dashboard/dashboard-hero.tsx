"use client";

import { PlanBadge } from "@/components/billing/plan-badge";
import { useSubscriptionAccess } from "@/components/billing/subscription-provider";
import {
  dashboardHeroInsightClassName,
  dashboardHeroInsightPositiveClassName,
  dashboardHeroMobileClassName,
  dashboardHeroPillClassName,
} from "@/lib/constants/dashboard-mobile";
import type { HeroInsight } from "@/lib/dashboard/hero-insights";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  /** Nom d'affichage entreprise (raison sociale). */
  title: string;
  /** Prénom ou identifiant court pour le salut. */
  greetingName: string;
  /** Ex. « Juin 2026 » */
  monthLabel: string;
  insights?: HeroInsight[];
}

export function DashboardHero({
  title,
  greetingName,
  monthLabel,
  insights = [],
}: DashboardHeroProps) {
  const { plan } = useSubscriptionAccess();
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <header className={dashboardHeroMobileClassName}>
      <div
        className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-[rgba(37,99,235,0.08)] blur-2xl md:hidden"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-[#0f172a] dark:text-[#f8fafc] sm:text-[1.625rem] sm:leading-[1.25]">
              {salutation} {greetingName}
              <span className="ml-1.5 inline-block" aria-hidden>
                👋
              </span>
            </h1>
            <PlanBadge
              plan={plan}
              className="hidden translate-y-px px-2 py-0 text-[10px] font-medium tracking-wide opacity-90 sm:inline-flex"
            />
          </div>
          <p className="max-w-md text-sm leading-snug text-[#64748b] dark:text-[#94a3b8]">
            <span className="font-medium text-[#334155] dark:text-[#e2e8f0]">
              {title}
            </span>
            <span className="hidden sm:inline"> — Vue d&apos;ensemble de votre activité.</span>
            <span className="sm:hidden"> · Activité du jour</span>
          </p>
        </div>

        <span className={dashboardHeroPillClassName}>{monthLabel}</span>
      </div>

      {insights.length > 0 ? (
        <ul className="relative mt-3.5 flex flex-wrap gap-2 md:mt-4">
          {insights.map((insight) => (
            <li key={insight.label}>
              <span
                className={cn(
                  insight.tone === "positive"
                    ? dashboardHeroInsightPositiveClassName
                    : dashboardHeroInsightClassName,
                )}
              >
                {insight.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <PlanBadge
        plan={plan}
        className="relative mt-3 translate-y-px px-2 py-0 text-[10px] font-medium tracking-wide opacity-90 sm:hidden"
      />
    </header>
  );
}

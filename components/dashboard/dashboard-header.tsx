"use client";

import { PlanBadge } from "@/components/billing/plan-badge";
import { useSubscriptionAccess } from "@/components/billing/subscription-provider";
import { PageHeader } from "@/components/layout/page-header";
import {
  dashboardHeroInsightClassName,
  dashboardHeroInsightPositiveClassName,
} from "@/lib/constants/dashboard-mobile";
import type { HeroInsight } from "@/lib/dashboard/hero-insights";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  greetingName: string;
  companyName: string;
  monthLabel: string;
  insights?: HeroInsight[];
  compact?: boolean;
}

export function DashboardHeader({
  greetingName,
  companyName,
  monthLabel,
  insights = [],
  compact = false,
}: DashboardHeaderProps) {
  const { plan } = useSubscriptionAccess();
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="min-w-0 space-y-3">
      <PageHeader
        title={`${salutation} ${greetingName}`}
        titleAccessory={<PlanBadge plan={plan} />}
        description={
          compact
            ? monthLabel
            : `${companyName} — ${monthLabel}. Vue d'ensemble de votre activité.`
        }
        descriptionClassName={compact ? "text-sm text-[#64748b] dark:text-[#94a3b8]" : undefined}
      />

      {insights.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
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
    </div>
  );
}

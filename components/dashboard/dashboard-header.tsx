"use client";

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
}

export function DashboardHeader({
  greetingName,
  companyName,
  monthLabel,
  insights = [],
}: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="min-w-0 space-y-3">
      <PageHeader
        title={`${salutation} ${greetingName}`}
        description={`${companyName} — ${monthLabel}. Vue d'ensemble de votre activité.`}
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

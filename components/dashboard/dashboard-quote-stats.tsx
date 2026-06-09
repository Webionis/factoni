import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { surfaceCardStatClassName, fadeInUpClassName } from "@/lib/constants/ui";
import type { QuoteDashboardStats } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

interface DashboardQuoteStatsProps {
  stats: QuoteDashboardStats;
}

export function DashboardQuoteStats({ stats }: DashboardQuoteStatsProps) {
  if (stats.totalQuotes === 0) {
    return null;
  }

  const items = [
    { label: "Devis actifs", value: String(stats.totalQuotes) },
    { label: "En attente", value: String(stats.pendingCount) },
    { label: "Acceptés", value: String(stats.acceptedCount) },
    {
      label: "Conversion",
      value: stats.conversionRate !== null ? `${stats.conversionRate}%` : "—",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Devis
        </h2>
        <Link
          href="/quotes"
          className="text-sm font-medium text-primary hover:underline"
        >
          Voir tout
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ label, value }, index) => (
          <article
            key={label}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "p-5 sm:p-6",
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.08)] text-[#2563eb] dark:bg-blue-500/15 dark:text-[#60a5fa]">
              <ClipboardList className="size-4" strokeWidth={2} aria-hidden />
            </div>
            <p className="mt-4 text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
              {value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

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
    <section className="min-w-0 space-y-3">
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
      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {items.map(({ label, value }, index) => (
          <article
            key={label}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "min-w-0 overflow-hidden p-3 md:p-6",
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-2 md:block">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.08)] text-[#2563eb] dark:bg-blue-500/15 dark:text-[#60a5fa] md:mb-0 md:size-9">
                <ClipboardList className="size-3.5 md:size-4" strokeWidth={2} aria-hidden />
              </div>
              <p className="text-lg font-semibold tabular-nums tracking-tight md:mt-0 md:text-xl">
                {value}
              </p>
            </div>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#94a3b8] md:mt-4 md:text-xs md:normal-case md:tracking-normal md:text-[#64748b]">
              {label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

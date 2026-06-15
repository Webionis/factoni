import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { QuoteDashboardStats } from "@/lib/data/dashboard";
import {
  fadeInUpClassName,
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardStatClassName,
} from "@/lib/constants/ui";
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
      value: stats.conversionRate !== null ? `${stats.conversionRate} %` : "—",
    },
  ];

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="dashboard-quotes-heading">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="dashboard-quotes-heading" className={sectionHeadingClassName}>
            Devis
          </h2>
          <p className={cn("mt-0.5", sectionSubheadingClassName)}>
            Suivi de vos devis en cours et de leur conversion.
          </p>
        </div>
        <Link
          href="/quotes"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-10 shrink-0 gap-1 px-2",
          )}
        >
          Tout voir
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {items.map(({ label, value }, index) => (
          <article
            key={label}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "@container/kpi min-w-0 overflow-hidden p-3 md:p-5",
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-2 md:block">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
                  "bg-[rgba(37,99,235,0.08)] text-[#2563eb] md:mb-3 md:size-10 md:rounded-xl",
                  "dark:bg-blue-500/15 dark:text-[#60a5fa]",
                )}
              >
                <ClipboardList className="size-4 md:size-[1.125rem]" strokeWidth={2} aria-hidden />
              </div>
              <p className="text-lg font-semibold tabular-nums tracking-tight text-[#0f172a] dark:text-[#f8fafc] md:text-2xl">
                {value}
              </p>
            </div>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] dark:text-[#64748b] md:mt-0 md:text-xs md:font-medium md:normal-case md:tracking-normal">
              {label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

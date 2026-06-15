import { FileText, FileWarning, PiggyBank, Pencil } from "lucide-react";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardStats } from "@/lib/data/dashboard";
import {
  fadeInUpClassName,
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardStatClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export type KpiValueType = "money" | "count";

export function getKpiValueClassName({
  type,
}: {
  value: string;
  type: KpiValueType;
}): string {
  return cn(
    "min-w-0 max-w-full font-semibold tabular-nums tracking-tight whitespace-nowrap leading-none text-[#0f172a] dark:text-[#f8fafc]",
    "text-lg sm:text-xl",
    "md:mt-1.5 md:text-[length:clamp(1.125rem,10.5cqw,2rem)]",
    type === "money" && "md:text-[length:clamp(0.875rem,8.5cqw,2rem)]",
  );
}

const STAT_ITEMS = [
  {
    key: "totalInvoices" as const,
    label: "Factures",
    icon: FileText,
    iconBg: "bg-blue-500/10 text-[#2563eb] dark:bg-blue-500/15 dark:text-[#60a5fa]",
    valueType: "count" as const,
    format: (v: number) => String(v),
  },
  {
    key: "monthRevenueTtc" as const,
    label: "CA TTC",
    shortLabel: "CA TTC",
    icon: PiggyBank,
    iconBg: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    valueType: "money" as const,
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "draftCount" as const,
    label: "Brouillons",
    icon: Pencil,
    iconBg: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    valueType: "count" as const,
    format: (v: number) => String(v),
  },
  {
    key: "overdueCount" as const,
    label: "En retard",
    icon: FileWarning,
    iconBg: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    valueType: "count" as const,
    format: (v: number) => String(v),
  },
];

interface DashboardStatGridProps {
  stats: DashboardStats;
}

export function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <section className="min-w-0 space-y-4" aria-labelledby="dashboard-kpi-heading">
      <div>
        <h2 id="dashboard-kpi-heading" className={sectionHeadingClassName}>
          Indicateurs clés
        </h2>
        <p className={cn("mt-0.5", sectionSubheadingClassName)}>
          Factures, chiffre d&apos;affaires et suivi du mois en cours.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, iconBg, valueType, format }, index) => {
        const display = format(stats[key]);
        const mobileLabel = key === "monthRevenueTtc" ? "CA TTC" : label;

        return (
          <article
            key={key}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "@container/kpi min-w-0 overflow-hidden p-3 md:p-5",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
                  "md:mb-3 md:size-11 md:rounded-xl",
                  iconBg,
                )}
              >
                <Icon className="size-4 md:size-5" strokeWidth={2} aria-hidden />
              </div>
              <p
                className={cn(
                  getKpiValueClassName({
                    value: display,
                    type: valueType,
                  }),
                  "md:text-2xl",
                )}
              >
                {display}
              </p>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] dark:text-[#64748b] md:text-xs md:font-medium md:normal-case md:tracking-normal">
              <span>{mobileLabel}</span>
            </p>
          </article>
        );
      })}
      </div>
    </section>
  );
}

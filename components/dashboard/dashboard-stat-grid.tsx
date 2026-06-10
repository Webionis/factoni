import { FileText, FileWarning, PiggyBank, Pencil } from "lucide-react";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardStats } from "@/lib/data/dashboard";
import { fadeInUpClassName, surfaceCardStatClassName } from "@/lib/constants/ui";
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
    <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, iconBg, valueType, format }, index) => {
        const display = format(stats[key]);
        const mobileLabel = key === "monthRevenueTtc" ? "CA TTC" : label;

        return (
          <article
            key={key}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "@container/kpi min-w-0 overflow-hidden p-3",
              "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.03)]",
              "md:p-6 md:shadow-none xl:p-7",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2 md:block">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
                  "md:mb-0 md:size-10 md:rounded-xl",
                  iconBg,
                )}
              >
                <Icon className="size-4 md:size-[1.125rem]" strokeWidth={2} aria-hidden />
              </div>
              <p
                className={getKpiValueClassName({
                  value: display,
                  type: valueType,
                })}
              >
                {display}
              </p>
            </div>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-[#94a3b8] dark:text-[#64748b] md:mt-5 md:text-xs md:normal-case md:tracking-normal">
              <span className="md:hidden">{mobileLabel}</span>
              <span className="hidden md:inline">{label}</span>
            </p>
          </article>
        );
      })}
    </div>
  );
}

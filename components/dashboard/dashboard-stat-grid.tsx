import { FileText, FileWarning, PiggyBank, Pencil } from "lucide-react";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardStats } from "@/lib/data/dashboard";
import { fadeInUpClassName, surfaceCardStatClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export type KpiValueType = "money" | "count";

/** Typographie fluide selon la largeur de la card (@container), pas la longueur du texte. */
export function getKpiValueClassName({
  type,
}: {
  value: string;
  type: KpiValueType;
}): string {
  return cn(
    "mt-1.5 min-w-0 max-w-full font-semibold tabular-nums tracking-tight whitespace-nowrap leading-none text-foreground",
    type === "money" && "text-[length:clamp(0.875rem,8.5cqw,2rem)]",
    type === "count" && "text-[length:clamp(1.125rem,10.5cqw,2rem)]",
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
    label: "CA TTC ce mois",
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
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon, iconBg, valueType, format }, index) => {
        const display = format(stats[key]);
        return (
          <article
            key={key}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "@container/kpi min-w-0 overflow-hidden p-5 sm:p-6 xl:p-7",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
                iconBg,
              )}
            >
              <Icon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
            </div>
            <p className="mt-5 text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              {label}
            </p>
            <p
              className={getKpiValueClassName({
                value: display,
                type: valueType,
              })}
            >
              {display}
            </p>
          </article>
        );
      })}
    </div>
  );
}

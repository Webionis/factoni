import { FileText, FileWarning, PiggyBank, Pencil } from "lucide-react";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { DashboardStats } from "@/lib/data/dashboard";
import {
  fadeInUpClassName,
  sectionHeadingClassName,
  surfaceCardStatClassName,
} from "@/lib/constants/ui";
import { dashboardSectionSubheadingClassName } from "@/lib/constants/dashboard-mobile";
import { cn } from "@/lib/utils";

export type KpiValueType = "money" | "count";

export function getKpiValueClassName({
  type,
  compact = false,
}: {
  value: string;
  type: KpiValueType;
  compact?: boolean;
}): string {
  if (compact) {
    return cn(
      "min-w-0 max-w-full truncate font-semibold tabular-nums leading-none text-[#0f172a] dark:text-[#f8fafc]",
      type === "money"
        ? "text-[length:clamp(0.625rem,15cqw,0.8125rem)] tracking-tight"
        : "text-base tracking-tight",
    );
  }

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
  compact?: boolean;
}

const COMPACT_STAT_KEYS: ReadonlySet<(typeof STAT_ITEMS)[number]["key"]> = new Set([
  "monthRevenueTtc",
  "totalInvoices",
  "overdueCount",
]);

export function DashboardStatGrid({ stats, compact = false }: DashboardStatGridProps) {
  const items = compact
    ? STAT_ITEMS.filter((item) => COMPACT_STAT_KEYS.has(item.key))
    : STAT_ITEMS;

  return (
    <section
      className={cn("min-w-0", compact ? "space-y-3" : "space-y-4")}
      aria-labelledby={compact ? undefined : "dashboard-kpi-heading"}
      aria-label={compact ? "Indicateurs clés" : undefined}
    >
      {!compact ? (
        <div>
          <h2 id="dashboard-kpi-heading" className={sectionHeadingClassName}>
            Indicateurs clés
          </h2>
          <p className={cn("mt-0.5", dashboardSectionSubheadingClassName)}>
            Factures, chiffre d&apos;affaires et suivi du mois en cours.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid min-w-0 gap-2.5 sm:gap-3",
          compact ? "grid-cols-3" : "grid-cols-2 xl:grid-cols-4",
        )}
      >
      {items.map(({ key, label, icon: Icon, iconBg, valueType, format }, index) => {
        const display = format(stats[key]);
        const mobileLabel = key === "monthRevenueTtc" ? "CA TTC" : label;

        return (
          <article
            key={key}
            className={cn(
              surfaceCardStatClassName,
              fadeInUpClassName,
              "@container/kpi min-w-0 overflow-hidden",
              compact ? "p-2.5" : "p-3 md:p-5",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
                  compact ? "size-8" : "size-9 md:mb-3 md:size-11 md:rounded-xl",
                  iconBg,
                )}
              >
                <Icon
                  className={cn(compact ? "size-3.5" : "size-4 md:size-5")}
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
              <p
                className={cn(
                  getKpiValueClassName({
                    value: display,
                    type: valueType,
                    compact,
                  }),
                  !compact && "md:text-2xl",
                )}
                title={valueType === "money" ? display : undefined}
              >
                {display}
              </p>
            </div>
            <p
              className={cn(
                "font-semibold uppercase tracking-[0.08em] text-[#94a3b8] dark:text-[#64748b]",
                compact
                  ? "mt-1 text-[9px] leading-tight"
                  : "text-[10px] md:text-xs md:font-medium md:normal-case md:tracking-normal",
              )}
            >
              <span>{mobileLabel}</span>
            </p>
          </article>
        );
      })}
      </div>
    </section>
  );
}

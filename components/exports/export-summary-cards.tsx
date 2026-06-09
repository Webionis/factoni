"use client";

import { formatSummaryCurrency } from "@/lib/exports/formatting";
import type { ExportSummary } from "@/lib/exports/types";
import { Skeleton } from "@/components/ui/skeleton";
import { premiumBorderClassName, premiumShadowClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ExportSummaryCardsProps {
  summary: ExportSummary | null;
  loading?: boolean;
}

interface SummaryRowData {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5 sm:py-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-24 shrink-0" />
      ) : (
        <span className="shrink-0 text-right text-base font-semibold tabular-nums tracking-tight whitespace-nowrap sm:text-lg">
          {value}
        </span>
      )}
    </div>
  );
}

function SummaryColumn({
  rows,
  loading,
  className,
}: {
  rows: SummaryRowData[];
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 divide-y divide-border/40", className)}>
      {rows.map((row) => (
        <SummaryRow
          key={row.label}
          label={row.label}
          value={row.value}
          loading={loading}
        />
      ))}
    </div>
  );
}

export function ExportSummaryCards({ summary, loading }: ExportSummaryCardsProps) {
  const rows: SummaryRowData[] = [
    { label: "Factures", value: String(summary?.invoiceCount ?? 0) },
    { label: "CA TTC", value: formatSummaryCurrency(summary?.totalTtc ?? 0) },
    {
      label: "TVA collectée",
      value: formatSummaryCurrency(summary?.totalVat ?? 0),
    },
    { label: "Total HT", value: formatSummaryCurrency(summary?.totalHt ?? 0) },
    { label: "Payées", value: String(summary?.paidCount ?? 0) },
    { label: "Impayées", value: String(summary?.unpaidCount ?? 0) },
  ];

  const leftColumn = rows.slice(0, 3);
  const rightColumn = rows.slice(3);

  return (
    <div
      className={cn(
        "w-full min-w-0 rounded-xl border bg-white px-4 py-1 sm:px-5 sm:py-2 dark:bg-[rgba(30,41,59,0.5)]",
        premiumBorderClassName,
        premiumShadowClassName,
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10 lg:gap-x-14">
        <SummaryColumn rows={leftColumn} loading={loading} />
        <SummaryColumn
          rows={rightColumn}
          loading={loading}
          className="md:border-t-0"
        />
      </div>
    </div>
  );
}

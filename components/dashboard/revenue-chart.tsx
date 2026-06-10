"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/invoices/calculate";
import type { RevenueChartPayload } from "@/lib/data/dashboard";
import {
  fadeInUpClassName,
  sectionSubheadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type ChartMode = "rolling" | "year";

interface RevenueChartProps {
  chart: RevenueChartPayload;
}

const GRID_LINES = 4;

function ChartBars({
  data,
  dense,
}: {
  data: { key: string; label: string; revenue: number }[];
  dense?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div
      className={cn(
        "relative flex items-end",
        dense
          ? "min-w-0 justify-between gap-1 px-0.5 sm:gap-1.5 lg:min-w-[34rem]"
          : "justify-between gap-2 sm:gap-3",
      )}
      role="presentation"
    >
      {data.map((point) => {
        const heightPct = Math.max((point.revenue / max) * 100, 8);
        return (
          <div
            key={point.key}
            className={cn(
              "flex min-w-0 flex-col items-center gap-2",
              dense ? "w-9 shrink-0 sm:w-auto sm:flex-1" : "flex-1",
            )}
          >
            <span
              className={cn(
                "font-medium tabular-nums tracking-tight text-slate-500 dark:text-[#94a3b8]",
                dense ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs",
              )}
            >
              {point.revenue > 0
                ? formatCurrency(point.revenue).replace(/\s/g, "\u00a0")
                : "—"}
            </span>
            <div
              className="flex w-full items-end justify-center px-0.5"
              style={{ height: "8rem" }}
            >
              <div
                className={cn(
                  "w-full rounded-t-md bg-gradient-to-t from-[#3478ff] to-[#2563eb] transition-all duration-[180ms] ease-out hover:brightness-105",
                  dense ? "max-w-7 sm:max-w-10" : "max-w-12 sm:max-w-14",
                )}
                style={{ height: `${heightPct}%` }}
                title={`${point.label} : ${formatCurrency(point.revenue)}`}
              />
            </div>
            <span
              className={cn(
                "font-medium text-slate-500 dark:text-[#94a3b8]",
                dense ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs",
              )}
            >
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RevenueChart({ chart }: RevenueChartProps) {
  const [mode, setMode] = useState<ChartMode>("rolling");
  const [selectedYear, setSelectedYear] = useState(chart.defaultYear);

  const activeData = useMemo(() => {
    if (mode === "rolling") return chart.last6Months;
    return chart.byYear[String(selectedYear)] ?? chart.byYear[String(chart.defaultYear)] ?? [];
  }, [mode, selectedYear, chart]);

  const title =
    mode === "rolling"
      ? "CA TTC — 6 derniers mois"
      : `CA TTC — année ${selectedYear}`;

  const ariaLabel =
    mode === "rolling"
      ? "Graphique du chiffre d'affaires sur six mois"
      : `Graphique du chiffre d'affaires pour l'année ${selectedYear}`;

  return (
    <section
      className={cn(surfaceCardClassName, fadeInUpClassName, "min-w-0 p-7 sm:p-8")}
      style={{ animationDelay: "120ms" }}
      aria-labelledby="revenue-chart-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            id="revenue-chart-heading"
            className="text-base font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]"
          >
            {title}
          </h2>
          <p className={cn("mt-1", sectionSubheadingClassName)}>
            Factures envoyées, payées ou en retard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <div
            className="inline-flex rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] p-0.5 dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.6)]"
            role="group"
            aria-label="Période du graphique"
          >
            <button
              type="button"
              onClick={() => setMode("rolling")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-[180ms] ease-out",
                mode === "rolling"
                  ? "bg-white text-[#0f172a] shadow-sm dark:bg-[#1e293b] dark:text-[#f8fafc]"
                  : "text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]",
              )}
            >
              6 mois
            </button>
            <button
              type="button"
              onClick={() => setMode("year")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-[180ms] ease-out",
                mode === "year"
                  ? "bg-white text-[#0f172a] shadow-sm dark:bg-[#1e293b] dark:text-[#f8fafc]"
                  : "text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]",
              )}
            >
              Année
            </button>
          </div>

          {mode === "year" && chart.availableYears.length > 1 ? (
            <label className="sr-only" htmlFor="revenue-chart-year">
              Année
            </label>
          ) : null}
          {mode === "year" && chart.availableYears.length > 1 ? (
            <select
              id="revenue-chart-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-8 rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-2.5 text-xs font-medium text-[#334155] shadow-sm outline-none transition-all duration-[180ms] focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-[#2563eb]/20 dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(15,23,42,0.75)] dark:text-[#cbd5e1]"
            >
              {chart.availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div
        className={cn("relative mt-8", mode === "year" && "overflow-x-auto pb-1")}
        role="img"
        aria-label={ariaLabel}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
          style={{ height: "8rem" }}
          aria-hidden
        >
          {Array.from({ length: GRID_LINES }).map((_, i) => (
            <div
              key={i}
              className="border-t border-slate-200/80 dark:border-[rgba(148,163,184,0.12)]"
              style={{ marginTop: i === 0 ? 0 : undefined }}
            />
          ))}
        </div>
        <div className={cn("relative", mode === "year" && "min-w-0")}>
          <ChartBars data={activeData} dense={mode === "year"} />
        </div>
      </div>
    </section>
  );
}

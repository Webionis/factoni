import { cn } from "@/lib/utils";

/** Hero dashboard — gradient subtil, mobile uniquement. */
export const dashboardHeroMobileClassName = cn(
  "relative -mx-4 overflow-hidden rounded-none px-4 py-5",
  "bg-gradient-to-br from-[#eff6ff] via-[#f8fafc] to-[#f1f5f9]",
  "ring-1 ring-inset ring-[rgba(37,99,235,0.06)]",
  "md:mx-0 md:rounded-none md:bg-transparent md:p-0 md:ring-0",
);

/** Pill date / indicateur hero. */
export const dashboardHeroPillClassName = cn(
  "inline-flex shrink-0 items-center rounded-full border border-[rgba(37,99,235,0.12)]",
  "bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#2563eb]",
  "shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm",
  "dark:border-[rgba(96,165,250,0.2)] dark:bg-[rgba(30,41,59,0.6)] dark:text-[#93c5fd]",
);

/** Chip indicateur positif sous le hero. */
export const dashboardHeroInsightClassName = cn(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
  "border border-[rgba(15,23,42,0.06)] bg-white/90 text-[#475569]",
  "shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
  "dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(30,41,59,0.5)] dark:text-[#94a3b8]",
);

export const dashboardHeroInsightPositiveClassName = cn(
  dashboardHeroInsightClassName,
  "border-[rgba(16,185,129,0.18)] bg-[rgba(16,185,129,0.06)] text-[#047857]",
  "dark:border-[rgba(52,211,153,0.2)] dark:bg-[rgba(16,185,129,0.1)] dark:text-emerald-400",
);

/** KPI compact mobile — carte blanche premium. */
export const dashboardKpiMobileCardClassName = cn(
  "rounded-xl border border-[rgba(15,23,42,0.06)] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.03)]",
  "dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(30,41,59,0.72)]",
  "md:rounded-2xl md:p-6 md:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.035)]",
);

/** Badge « Nouveau » activité premium. */
export const dashboardActivityNewBadgeClassName = cn(
  "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5",
  "text-[9px] font-bold uppercase tracking-[0.08em] text-[#2563eb]",
  "bg-gradient-to-b from-[rgba(37,99,235,0.12)] to-[rgba(37,99,235,0.06)]",
  "ring-1 ring-inset ring-[rgba(37,99,235,0.14)]",
  "dark:from-[rgba(59,130,246,0.2)] dark:to-[rgba(59,130,246,0.1)] dark:text-[#93c5fd] dark:ring-[rgba(96,165,250,0.2)]",
);

/** Espacement sections dashboard mobile. */
export const dashboardSectionStackClassName = "space-y-7 md:space-y-12";

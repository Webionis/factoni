import { addDaysToIsoDate } from "@/lib/dates/invoice-dates";
import { parisCalendarIsoDate } from "@/lib/dates/timezone";
import type { PeriodPresetId } from "@/lib/exports/types";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

function getParisYmd(reference: Date): { year: number; month: number; day: number } {
  const iso = parisCalendarIsoDate(reference);
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function startOfMonthParis(reference: Date): string {
  const { year, month } = getParisYmd(reference);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function endOfMonthParis(reference: Date): string {
  const { year, month } = getParisYmd(reference);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function startOfQuarterParis(reference: Date): string {
  const { year, month } = getParisYmd(reference);
  const quarterMonth = Math.floor((month - 1) / 3) * 3 + 1;
  return `${year}-${String(quarterMonth).padStart(2, "0")}-01`;
}

export const PERIOD_PRESETS: {
  id: PeriodPresetId;
  label: string;
}[] = [
  { id: "this_month", label: "Ce mois" },
  { id: "last_month", label: "Mois dernier" },
  { id: "this_year", label: "Cette année" },
  { id: "last_year", label: "Année précédente" },
  { id: "last_30_days", label: "30 derniers jours" },
  { id: "current_quarter", label: "Trimestre actuel" },
];

export function resolvePeriodPreset(
  presetId: PeriodPresetId,
  reference = new Date(),
): DateRange {
  const { year, month } = getParisYmd(reference);
  const today = parisCalendarIsoDate(reference);

  switch (presetId) {
    case "this_month":
      return {
        dateFrom: startOfMonthParis(reference),
        dateTo: endOfMonthParis(reference),
      };
    case "last_month": {
      const last = new Date(year, month - 2, 1);
      return {
        dateFrom: startOfMonthParis(last),
        dateTo: endOfMonthParis(last),
      };
    }
    case "this_year":
      return {
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
    case "last_year":
      return {
        dateFrom: `${year - 1}-01-01`,
        dateTo: `${year - 1}-12-31`,
      };
    case "last_30_days": {
      const from = addDaysToIsoDate(today, -29);
      return {
        dateFrom: from ?? today,
        dateTo: today,
      };
    }
    case "current_quarter":
      return {
        dateFrom: startOfQuarterParis(reference),
        dateTo: today,
      };
    default:
      return { dateFrom: "", dateTo: "" };
  }
}

import type { PeriodPresetId } from "@/lib/exports/types";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
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
  const year = reference.getFullYear();
  const month = reference.getMonth();

  switch (presetId) {
    case "this_month":
      return {
        dateFrom: toIsoDate(startOfMonth(reference)),
        dateTo: toIsoDate(endOfMonth(reference)),
      };
    case "last_month": {
      const last = new Date(year, month - 1, 1);
      return {
        dateFrom: toIsoDate(startOfMonth(last)),
        dateTo: toIsoDate(endOfMonth(last)),
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
      const from = new Date(reference);
      from.setDate(from.getDate() - 29);
      return {
        dateFrom: toIsoDate(from),
        dateTo: toIsoDate(reference),
      };
    }
    case "current_quarter":
      return {
        dateFrom: toIsoDate(startOfQuarter(reference)),
        dateTo: toIsoDate(reference),
      };
    default:
      return { dateFrom: "", dateTo: "" };
  }
}

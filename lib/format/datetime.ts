import {
  formatParisCalendarDate,
  formatParisDateTime,
} from "@/lib/dates/timezone";

/** Format français : 7 juin 2026 à 22:30 (heure de Paris). */
export function formatFrenchDateTime(
  iso: string | null | undefined,
): string {
  return formatParisDateTime(iso);
}

export function formatFrenchCalendarDate(
  isoDate: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatParisCalendarDate(isoDate, options);
}

export {
  FACTONI_LOCALE,
  FACTONI_TIMEZONE,
  createParisFormatter,
  formatParisCalendarDate,
  formatParisDateTime,
  parisCalendarIsoDate,
} from "@/lib/dates/timezone";

/** Fuseau horaire et locale applicatifs Factoni (France métropolitaine). */
export const FACTONI_TIMEZONE = "Europe/Paris";
export const FACTONI_LOCALE = "fr-FR";

const parisDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: FACTONI_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Date calendaire du jour en France (YYYY-MM-DD). */
export function parisCalendarIsoDate(reference = new Date()): string {
  return parisDateFormatter.format(reference);
}

export function createParisFormatter(
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(FACTONI_LOCALE, {
    timeZone: FACTONI_TIMEZONE,
    ...options,
  });
}

/** Horodatage ISO → affichage français avec heure (fuseau Paris). */
export function formatParisDateTime(
  iso: string | null | undefined,
): string {
  if (!iso) return "";
  try {
    return createParisFormatter({
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** Date calendaire ISO (YYYY-MM-DD) → affichage français sans décalage. */
export function formatParisCalendarDate(
  isoDate: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  if (!isoDate) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.slice(0, 10));
  if (!match) {
    return formatParisDateTime(isoDate);
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0,
  );

  try {
    return createParisFormatter(options).format(date);
  } catch {
    return isoDate;
  }
}

import { DEFAULT_QUOTE_VALIDITY_DAYS } from "@/lib/constants/quote-terms";

/** Date de validité = émission + N jours (format ISO YYYY-MM-DD). */
export function addDaysToIsoDate(
  isoDate: string,
  days: number,
): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultQuoteValidityDate(issueDate: string): string {
  return addDaysToIsoDate(issueDate, DEFAULT_QUOTE_VALIDITY_DAYS) ?? issueDate;
}

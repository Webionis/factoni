/**
 * Dates facture au format ISO (YYYY-MM-DD), sans décalage timezone.
 */

function parseIsoDateParts(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function formatIsoDateParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Ajoute un mois calendaire (31/01 → 28/02, 31/03 → 30/04, etc.).
 */
export function addOneMonthToIsoDate(isoDate: string): string | null {
  const parts = parseIsoDateParts(isoDate);
  if (!parts) return null;

  let { year, month, day } = parts;
  if (month === 12) {
    year += 1;
    month = 1;
  } else {
    month += 1;
  }

  const lastDayOfTargetMonth = new Date(year, month, 0).getDate();
  day = Math.min(day, lastDayOfTargetMonth);

  return formatIsoDateParts(year, month, day);
}

export function todayIsoDate(): string {
  const now = new Date();
  return formatIsoDateParts(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
}

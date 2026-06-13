/** Utilitaires de plage calendrier (semaine / mois) — dates locales ISO YYYY-MM-DD. */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeek(date: Date, weekStartsOnMonday = true): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diff = weekStartsOnMonday
    ? day === 0
      ? -6
      : 1 - day
    : -day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function endOfWeek(date: Date, weekStartsOnMonday = true): Date {
  const start = startOfWeek(date, weekStartsOnMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date, reference = new Date()): boolean {
  return isSameDay(date, reference);
}

export function formatWeekRangeLabel(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const fmtYear = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} – ${fmt.format(end)} ${end.getFullYear()}`;
  }
  return `${fmtYear.format(start)} – ${fmtYear.format(end)}`;
}

export function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatShortDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Grille mois : cases du calendrier incluant jours hors mois. */
export function buildMonthGrid(reference: Date): Date[] {
  const first = startOfMonth(reference);
  const last = endOfMonth(reference);
  const gridStart = startOfWeek(first, true);
  const gridEnd = endOfWeek(last, true);
  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function daysInWeek(weekAnchor: Date): Date[] {
  const start = startOfWeek(weekAnchor, true);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

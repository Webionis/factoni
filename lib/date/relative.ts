/**
 * Temps relatif en français (dashboard notifications).
 */
export function formatRelativeTimeFr(
  dateInput: string | Date,
  reference = new Date(),
): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diffMs = reference.getTime() - date.getTime();

  if (diffMs < 0) return "à l'instant";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 45) return "à l'instant";
  if (diffMin < 60) {
    return diffMin === 1 ? "il y a 1 min" : `il y a ${diffMin} min`;
  }
  if (diffHour < 24) {
    return diffHour === 1 ? "il y a 1 heure" : `il y a ${diffHour} heures`;
  }

  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "hier";
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return diffDay === 1 ? "il y a 1 jour" : `il y a ${diffDay} jours`;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

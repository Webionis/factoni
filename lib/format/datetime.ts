/** Format français : 7 juin 2026 à 22:30 */
export function formatFrenchDateTime(
  iso: string | null | undefined,
): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
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

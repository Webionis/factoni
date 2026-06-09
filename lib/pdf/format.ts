/** Formatage pour les documents PDF (indépendant de l'UI web) */

/**
 * Intl.NumberFormat("fr-FR") groupe les milliers avec U+202F (espace fine insécable).
 * @react-pdf/renderer ne dispose pas de cette glyphe et affiche "/" à la place.
 */
function sanitizePdfIntlString(value: string): string {
  return value
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u2009/g, " ");
}

export function formatPdfDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/** Format français avec heure : 7 juin 2026 à 22:30 */
export function formatPdfDateTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatPdfMoney(amount: number): string {
  return sanitizePdfIntlString(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount),
  );
}

export function formatPdfQuantity(qty: number): string {
  const n = Number(qty);
  if (Number.isInteger(n)) return String(n);
  return sanitizePdfIntlString(
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 3,
    }).format(n),
  );
}

export function formatPdfPercent(rate: number): string {
  return `${sanitizePdfIntlString(
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    }).format(rate),
  )} %`;
}

export function sanitizePdfFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

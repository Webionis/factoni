/** Supprime caractères de contrôle et limite la longueur des champs texte. */
export function sanitizeText(value: string, maxLength = 10_000): string {
  return value
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeOptionalText(
  value: string | undefined | null,
  maxLength = 10_000,
): string | null {
  if (value == null || value === "") return null;
  const cleaned = sanitizeText(value, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

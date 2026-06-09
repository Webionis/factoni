/** Utilitaires pour champs numériques contrôlés en string (formulaires facture). */

export function isZeroNumericValue(value: number | undefined | null): boolean {
  if (value === undefined || value === null || Number.isNaN(value)) return true;
  return value === 0;
}

/** True si le champ doit être vidé au focus (ex. 0 pour PU HT, 1 pour Qté). */
export function shouldClearNumericOnFocus(
  value: number | undefined | null,
  clearOnFocusValue: number,
): boolean {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return clearOnFocusValue === 0;
  }
  return Number(value) === clearOnFocusValue;
}

export function formatNumericFieldDisplay(
  value: number | undefined | null,
  emptyDisplay = "0",
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return emptyDisplay;
  }
  return String(value);
}

export function sanitizeNumericInput(raw: string, allowDecimal: boolean): string {
  const normalized = raw.replace(/,/g, ".");
  if (!allowDecimal) {
    return normalized.replace(/\D/g, "");
  }
  let result = "";
  let dotUsed = false;
  for (const char of normalized) {
    if (char >= "0" && char <= "9") {
      result += char;
      continue;
    }
    if (char === "." && !dotUsed) {
      dotUsed = true;
      result += char;
    }
  }
  return result;
}

export function parseNumericInputString(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/,/g, ".");
  if (trimmed === "" || trimmed === ".") return undefined;
  const n = Number(trimmed);
  return Number.isNaN(n) ? undefined : n;
}

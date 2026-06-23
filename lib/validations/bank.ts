/** Normalise IBAN (espaces, majuscules). */
export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** Format affichage IBAN par groupes de 4. */
export function formatIbanDisplay(iban: string): string {
  const normalized = normalizeIban(iban);
  return normalized.replace(/(.{4})/g, "$1 ").trim();
}

const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

export function isValidIban(value: string): boolean {
  const normalized = normalizeIban(value);
  if (!IBAN_PATTERN.test(normalized)) return false;
  return mod97IbanCheck(normalized);
}

function mod97IbanCheck(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String(code - 55);
      return char;
    })
    .join("");

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const block = String(remainder) + numeric.slice(i, i + 7);
    remainder = Number(BigInt(block) % BigInt(97));
  }
  return remainder === 1;
}

const BIC_PATTERN = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export function normalizeBic(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function isValidBic(value: string): boolean {
  return BIC_PATTERN.test(normalizeBic(value));
}

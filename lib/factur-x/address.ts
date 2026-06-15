import type { AddressInput } from "@stackforge-eu/factur-x";

const FR_POSTAL_CITY_RE = /^(\d{5})\s+(.+)$/;

export function addressLinesToFacturXAddress(
  lines: string[],
  defaultCountry = "FR",
): AddressInput {
  if (lines.length === 0) {
    return {
      line1: "Adresse non renseignée",
      city: "Non renseignée",
      postalCode: "00000",
      country: defaultCountry,
    };
  }

  const normalized = lines.map((line) => line.trim()).filter(Boolean);
  const country =
    normalized.length > 1 && normalized[normalized.length - 1]!.length === 2
      ? normalized.pop()!
      : defaultCountry;

  let city = "Non renseignée";
  let postalCode = "00000";
  let streetLines = normalized;

  if (normalized.length > 0) {
    const last = normalized[normalized.length - 1]!;
    const match = last.match(FR_POSTAL_CITY_RE);
    if (match) {
      postalCode = match[1]!;
      city = match[2]!;
      streetLines = normalized.slice(0, -1);
    } else {
      city = last;
      streetLines = normalized.slice(0, -1);
    }
  }

  return {
    line1: streetLines[0] ?? "Adresse non renseignée",
    line2: streetLines[1],
    line3: streetLines[2],
    city,
    postalCode,
    country: country.length === 2 ? country : defaultCountry,
  };
}

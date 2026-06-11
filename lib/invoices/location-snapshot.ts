import type { Json } from "@/types/database";
import type { ClientLocationRow } from "@/lib/data/client-locations";
import type { PdfParty } from "@/lib/pdf/types";

export type ClientLocationSnapshot = {
  id: string;
  label: string;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
};

function asRecord(value: Json | null): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function str(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

export function buildClientLocationSnapshot(
  location: Pick<
    ClientLocationRow,
    | "id"
    | "label"
    | "address_line1"
    | "address_line2"
    | "postal_code"
    | "city"
    | "country"
    | "notes"
  >,
): Json {
  return {
    id: location.id,
    label: location.label,
    address_line1: location.address_line1,
    address_line2: location.address_line2,
    postal_code: location.postal_code,
    city: location.city,
    country: location.country,
    notes: location.notes,
  };
}

export function parseClientLocationSnapshot(
  json: Json | null,
): ClientLocationSnapshot | null {
  const r = asRecord(json);
  if (!r) return null;

  const label = str(r.label);
  const id = str(r.id);
  if (!label || !id) return null;

  return {
    id,
    label,
    address_line1: str(r.address_line1),
    address_line2: str(r.address_line2),
    postal_code: str(r.postal_code),
    city: str(r.city),
    country: str(r.country),
    notes: str(r.notes),
  };
}

export function formatClientLocationAddress(
  location: Pick<
    ClientLocationSnapshot,
    "address_line1" | "address_line2" | "postal_code" | "city" | "country"
  >,
): string {
  const lines: string[] = [];
  if (location.address_line1) lines.push(location.address_line1);
  if (location.address_line2) lines.push(location.address_line2);
  const cityLine = [location.postal_code, location.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (location.country && location.country !== "France") {
    lines.push(location.country);
  }
  return lines.join("\n");
}

export function clientLocationToPdfParty(
  snapshot: ClientLocationSnapshot,
): PdfParty {
  const addressLines: string[] = [];
  if (snapshot.address_line1) addressLines.push(snapshot.address_line1);
  if (snapshot.address_line2) addressLines.push(snapshot.address_line2);
  const cityLine = [snapshot.postal_code, snapshot.city].filter(Boolean).join(" ");
  if (cityLine) addressLines.push(cityLine);
  if (snapshot.country && snapshot.country !== "France") {
    addressLines.push(snapshot.country);
  }

  return {
    name: snapshot.label,
    addressLines,
  };
}

export function interventionLocationEmailLine(json: Json | null): string | null {
  const location = parseClientLocationSnapshot(json);
  if (!location) return null;
  return `Lieu d'intervention : ${location.label}`;
}

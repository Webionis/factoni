import type { Json } from "@/types/database";
import type { PdfParty } from "@/lib/pdf/types";
import type { VatRegime } from "@/lib/constants/vat";
import { FRANCHISE_MENTION } from "@/lib/constants/vat";

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

function addressLinesFromRecord(r: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const l1 = str(r.address_line1);
  const l2 = str(r.address_line2);
  const postal = str(r.postal_code);
  const city = str(r.city);
  const country = str(r.country);

  if (l1) lines.push(l1);
  if (l2) lines.push(l2);
  const cityLine = [postal, city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (country && country !== "FR") lines.push(country);
  return lines;
}

export function parseCompanySnapshot(json: Json | null): {
  party: PdfParty;
  vatRegime: VatRegime;
  legalMentions: string | null;
  logoPath: string | null;
  bank_account_holder: string | null;
  bank_name: string | null;
  bank_iban: string | null;
  bank_bic: string | null;
  bank_show_on_invoices: boolean;
  bank_show_on_quotes: boolean;
} | null {
  const r = asRecord(json);
  if (!r) return null;

  const tradeName = str(r.trade_name) ?? "Entreprise";
  const legalName = str(r.legal_name);
  const vatRegime = (str(r.vat_regime) as VatRegime) ?? "standard";

  return {
    party: {
      name: tradeName,
      subtitle: legalName && legalName !== tradeName ? legalName : null,
      addressLines: addressLinesFromRecord(r),
      email: str(r.email),
      phone: str(r.phone),
      siren: str(r.siren),
      siret: str(r.siret),
      vatNumber: str(r.vat_number),
    },
    vatRegime,
    legalMentions:
      str(r.legal_mentions) ??
      (vatRegime === "franchise" ? FRANCHISE_MENTION : null),
    logoPath: str(r.logo_path),
    bank_account_holder: str(r.bank_account_holder),
    bank_name: str(r.bank_name),
    bank_iban: str(r.bank_iban),
    bank_bic: str(r.bank_bic),
    bank_show_on_invoices: r.bank_show_on_invoices !== false,
    bank_show_on_quotes: r.bank_show_on_quotes === true,
  };
}

export function parseClientSnapshot(json: Json | null): PdfParty | null {
  const r = asRecord(json);
  if (!r) return null;

  const clientType = str(r.client_type);
  const companyName = str(r.company_name);
  const name = str(r.name) ?? "Client";

  const displayName =
    clientType === "company" && companyName ? companyName : name;
  const subtitle =
    clientType === "company" && companyName ? name : null;

  return {
    name: displayName,
    subtitle,
    addressLines: addressLinesFromRecord(r),
    email: str(r.email),
    phone: str(r.phone),
    siren: str(r.siren),
    siret: str(r.siret),
  };
}

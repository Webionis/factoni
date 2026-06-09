import type { Json } from "@/types/database";
import type { ClientRow } from "@/lib/validations/client";
import type { Database } from "@/types/database";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export function buildClientSnapshot(client: ClientRow): Json {
  return {
    id: client.id,
    client_type: client.client_type,
    name: client.name,
    company_name: client.company_name,
    email: client.email,
    phone: client.phone,
    address_line1: client.address_line1,
    address_line2: client.address_line2,
    postal_code: client.postal_code,
    city: client.city,
    country: client.country,
    siren: client.siren,
    siret: client.siret,
  };
}

export function buildCompanySnapshot(company: CompanyRow): Json {
  return {
    id: company.id,
    trade_name: company.trade_name,
    legal_name: company.legal_name,
    address_line1: company.address_line1,
    address_line2: company.address_line2,
    postal_code: company.postal_code,
    city: company.city,
    country: company.country,
    email: company.email,
    phone: company.phone,
    siren: company.siren,
    siret: company.siret,
    vat_number: company.vat_number,
    vat_regime: company.vat_regime,
    default_vat_rate: company.default_vat_rate,
    legal_mentions: company.legal_mentions,
    payment_terms: company.payment_terms,
    logo_path: company.logo_path,
  };
}

import type { FrenchVatRate, VatRegime } from "@/lib/constants/vat";

/** Statuts facture MVP */
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

/** Extension future : abonnements SaaS (non implémenté au MVP) */
export interface SubscriptionPlaceholder {
  plan: "free" | "pro" | "business";
  status: "active" | "trialing" | "canceled";
}

export interface CompanyProfile {
  tradeName: string;
  legalName: string;
  vatRegime: VatRegime;
  defaultVatRate: FrenchVatRate;
}

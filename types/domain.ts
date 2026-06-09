import type { FrenchVatRate, VatRegime } from "@/lib/constants/vat";

/** Statuts facture MVP */
export type InvoiceStatus =
  | "draft"
  | "ready"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

/** @deprecated Utiliser `SubscriptionPlan` depuis `@/lib/billing/types` */
export type { SubscriptionPlan, SubscriptionStatus } from "@/lib/billing/types";

export interface CompanyProfile {
  tradeName: string;
  legalName: string;
  vatRegime: VatRegime;
  defaultVatRate: FrenchVatRate;
}

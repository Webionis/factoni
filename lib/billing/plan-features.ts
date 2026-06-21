import type { SubscriptionPlan } from "@/lib/billing/types";

/**
 * Listes tarifaires — source unique pour la landing et /settings/billing.
 * Chaque fonctionnalité visible sur le site marketing ou dans l'app
 * doit figurer ici (Starter ou Pro).
 */
export const STARTER_PLAN_MARKETING_FEATURES = [
  "Devis & factures illimités",
  "Clients illimités",
  "Agenda & rendez-vous planifiés",
  "Catalogue de prestations",
  "PDF pro avec votre logo",
  "Numérotation légale automatique",
  "Exports comptables CSV",
  "Sans branding Factoni",
  "Interface mobile-first",
] as const;

export const PRO_ONLY_MARKETING_FEATURES = [
  "Relances automatiques",
  "Suivi & analytics avancés",
  "Signature de devis en ligne",
  "Portail client & liens sécurisés",
  "Paiements en ligne (acomptes & factures)",
  "Automatisations métier",
  "Préparation facturation électronique",
] as const;

export const PRO_PLAN_MARKETING_FEATURES = [
  "Tout Starter inclus",
  ...PRO_ONLY_MARKETING_FEATURES,
] as const;

export type PaidMarketingPlan = Exclude<SubscriptionPlan, "beta" | "free">;

export function getMarketingFeaturesForPlan(
  plan: PaidMarketingPlan,
): readonly string[] {
  return plan === "starter"
    ? STARTER_PLAN_MARKETING_FEATURES
    : PRO_PLAN_MARKETING_FEATURES;
}

/** Répartition des blocs marketing → offre minimale */
export const MARKETING_CAPABILITY_PLANS = {
  quotes: "starter",
  invoices: "starter",
  clients: "starter",
  agenda: "starter",
  catalog: "starter",
  pdfLogo: "starter",
  legalNumbering: "starter",
  accountingExport: "starter",
  removeBranding: "starter",
  mobileFirst: "starter",
  einvoicingReadiness: "starter",
  automaticReminders: "pro",
  advancedAnalytics: "pro",
  quoteSignature: "pro",
  clientPortal: "pro",
  onlinePayments: "pro",
  automation: "pro",
  einvoicingTransmission: "pro",
} as const satisfies Record<string, PaidMarketingPlan>;

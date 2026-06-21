import { FEATURE_MIN_PLAN } from "@/lib/billing/features";
import { PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { FeatureKey } from "@/lib/billing/types";

const FEATURE_LABELS: Record<FeatureKey, string> = {
  unlimitedInvoices: "factures illimitées",
  unlimitedClients: "clients illimités",
  accountingExport: "exports comptables",
  agendaScheduling: "agenda",
  automaticReminders: "relances automatiques",
  advancedAnalytics: "statistiques avancées",
  removeBranding: "retrait du branding Factoni",
  customLogo: "logo personnalisé",
  automation: "paiements en ligne et automatisations",
  advancedTracking: "signature de devis et portail client",
};

export function getFeatureLabel(feature: FeatureKey): string {
  return FEATURE_LABELS[feature];
}

export function getFeatureDeniedMessage(feature: FeatureKey): string {
  const planName = PLAN_DISPLAY_NAMES[FEATURE_MIN_PLAN[feature]];
  const label = FEATURE_LABELS[feature];
  return `La fonctionnalité « ${label} » est réservée à l'offre ${planName}.`;
}

export function getFeatureUpgradeLabel(feature: FeatureKey): string {
  const planName = PLAN_DISPLAY_NAMES[FEATURE_MIN_PLAN[feature]];
  return `Passer à ${planName}`;
}

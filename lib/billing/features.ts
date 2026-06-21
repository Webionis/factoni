import type { FeatureKey, PlanFeatures, SubscriptionPlan } from "@/lib/billing/types";

/** Pendant la bêta : toutes les features actives */
export const BETA_PLAN_FEATURES: PlanFeatures = {
  unlimitedInvoices: true,
  unlimitedClients: true,
  accountingExport: true,
  agendaScheduling: true,
  automaticReminders: true,
  advancedAnalytics: true,
  removeBranding: true,
  customLogo: true,
  automation: true,
  advancedTracking: true,
};

const FREE_FEATURES: PlanFeatures = {
  unlimitedInvoices: false,
  unlimitedClients: false,
  accountingExport: false,
  agendaScheduling: false,
  automaticReminders: false,
  advancedAnalytics: false,
  removeBranding: false,
  customLogo: false,
  automation: false,
  advancedTracking: false,
};

const STARTER_FEATURES: PlanFeatures = {
  unlimitedInvoices: true,
  unlimitedClients: true,
  accountingExport: true,
  agendaScheduling: true,
  automaticReminders: false,
  advancedAnalytics: false,
  removeBranding: true,
  customLogo: true,
  automation: false,
  advancedTracking: false,
};

const PRO_FEATURES: PlanFeatures = {
  unlimitedInvoices: true,
  unlimitedClients: true,
  accountingExport: true,
  agendaScheduling: true,
  automaticReminders: true,
  advancedAnalytics: true,
  removeBranding: true,
  customLogo: true,
  automation: true,
  advancedTracking: true,
};

/** Mapping plan → features (hors bêta) */
export const PLAN_FEATURES: Record<
  Exclude<SubscriptionPlan, "beta">,
  PlanFeatures
> = {
  free: FREE_FEATURES,
  starter: STARTER_FEATURES,
  pro: PRO_FEATURES,
};

export function resolvePlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  if (plan === "beta") return BETA_PLAN_FEATURES;
  return PLAN_FEATURES[plan];
}

/** Plan minimum requis pour une feature (UI hints) */
export const FEATURE_MIN_PLAN: Record<FeatureKey, SubscriptionPlan> = {
  unlimitedInvoices: "starter",
  unlimitedClients: "starter",
  accountingExport: "starter",
  agendaScheduling: "starter",
  automaticReminders: "pro",
  advancedAnalytics: "pro",
  removeBranding: "starter",
  customLogo: "starter",
  automation: "pro",
  advancedTracking: "pro",
};

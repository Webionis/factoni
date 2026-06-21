/**
 * Types billing Factoni — alignés sur les enums Supabase.
 */

export const SUBSCRIPTION_PLANS = ["beta", "free", "starter", "pro"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "cancelled",
  "past_due",
  "trialing",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Clés de fonctionnalités — source unique pour permissions & UI */
export const FEATURE_KEYS = [
  "unlimitedInvoices",
  "unlimitedClients",
  "accountingExport",
  "agendaScheduling",
  "automaticReminders",
  "advancedAnalytics",
  "removeBranding",
  "customLogo",
  "automation",
  "advancedTracking",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type PlanFeatures = Record<FeatureKey, boolean>;

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  cancel_at_period_end: boolean;
  pending_plan: SubscriptionPlan | null;
  pending_plan_effective_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Contexte d'accès résolu pour l'app (serveur → client) */
export interface SubscriptionAccess {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: PlanFeatures;
  isBeta: boolean;
  isActive: boolean;
  limitsEnforced: boolean;
}

import type { SubscriptionPlan } from "@/lib/billing/types";

import { isProductionLaunchActive } from "./launch-config";
import {
  PRO_PLAN_MARKETING_FEATURES,
  STARTER_PLAN_MARKETING_FEATURES,
} from "./plan-features";

/** Wording public — offre de lancement (plan interne DB : `beta`). */
export const LAUNCH_OFFER = {
  name: "Offre de lancement",
  earlyAccess: "Accès anticipé",
  foundersPro: "Plan Pro offert aux membres fondateurs",
  foundersProFootnote:
    "Le plan Pro est offert pendant la phase de lancement aux premiers professionnels utilisant Factoni.",
  noCardRequired: "Aucune carte bancaire requise pendant l'offre de lancement.",
  signupHint: "Plan Pro offert aux membres fondateurs — accès anticipé.",
  /** Inscription en mode lancement commercial */
  signupHintLaunch:
    "Offre gratuite — jusqu'à 10 factures et 5 clients. Passez à Starter ou Pro pour tout débloquer.",
  pricingLeadLaunch:
    "Commencez gratuitement, puis choisissez Starter ou Pro selon vos besoins.",
  pricingFooterLaunch:
    "Paiement sécurisé par Stripe. Résiliation à tout moment depuis votre espace.",
} as const;

export interface PlanMarketingInfo {
  id: SubscriptionPlan;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  priceLabel: string;
  priceSuffix?: string;
  highlighted?: boolean;
  ctaLabel: string;
  ctaFootnote?: string;
  features: readonly string[];
}

/** Offres affichées sur la landing */
export const PUBLIC_PRICING_PLANS: PlanMarketingInfo[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Le plus populaire",
    tagline: "Pour facturer et organiser votre activité",
    description:
      "Devis, factures, clients, agenda et exports — l'essentiel pour les indépendants au quotidien.",
    priceLabel: "19 €",
    priceSuffix: "/ mois",
    highlighted: true,
    ctaLabel: "Commencer gratuitement",
    features: STARTER_PLAN_MARKETING_FEATURES,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Professionnels",
    tagline: "Automatisation, paiements & suivi avancé",
    description:
      "Relances, signatures, portail client et paiements en ligne pour aller plus loin.",
    priceLabel: "39 €",
    priceSuffix: "/ mois",
    ctaLabel: "Accès fondateurs",
    ctaFootnote: LAUNCH_OFFER.foundersProFootnote,
    features: PRO_PLAN_MARKETING_FEATURES,
  },
];

export function getSignupMarketingHint(): string {
  return isProductionLaunchActive()
    ? LAUNCH_OFFER.signupHintLaunch
    : LAUNCH_OFFER.signupHint;
}

export function getLandingPricingLead(): string {
  if (isProductionLaunchActive()) {
    return `Starter à 19 €/mois · Pro à 39 €/mois. ${LAUNCH_OFFER.pricingLeadLaunch}`;
  }
  return `Starter à 19 €/mois · Pro à 39 €/mois. ${LAUNCH_OFFER.earlyAccess.toLowerCase()} — sans carte bancaire.`;
}

export function getLandingPricingFooter(): string {
  return isProductionLaunchActive()
    ? LAUNCH_OFFER.pricingFooterLaunch
    : LAUNCH_OFFER.noCardRequired;
}

/** Tarifs landing — CTAs adaptés au mode lancement vs bêta fondateurs */
export function getPublicPricingPlans(): PlanMarketingInfo[] {
  if (!isProductionLaunchActive()) {
    return PUBLIC_PRICING_PLANS;
  }

  return PUBLIC_PRICING_PLANS.map((plan) => ({
    ...plan,
    ctaLabel:
      plan.id === "starter" ? "Commencer gratuitement" : "Choisir Pro",
    ctaFootnote: undefined,
  }));
}

export const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  beta: LAUNCH_OFFER.name,
  free: "Gratuit",
  starter: "Starter",
  pro: "Pro",
};

/** Config cartes — page app /settings/billing */
export interface BillingPlanCardConfig {
  id: Exclude<SubscriptionPlan, "beta" | "free">;
  tierBadge: string;
  name: string;
  description: string;
  features: readonly string[];
  price: string;
  ctaLabel: string;
  ctaFootnote?: string;
  highlighted?: boolean;
  disabled: boolean;
}

export const BILLING_PAGE_PLANS: BillingPlanCardConfig[] = [
  {
    id: "starter",
    tierBadge: "Le plus populaire",
    name: "Starter",
    description:
      "Devis, factures, clients, agenda et exports pour facturer au quotidien.",
    features: STARTER_PLAN_MARKETING_FEATURES,
    price: "19 € / mois",
    highlighted: true,
    ctaLabel: "Choisir Starter",
    disabled: false,
  },
  {
    id: "pro",
    tierBadge: "Professionnels",
    name: "Pro",
    description:
      "Automatisez relances, signatures, paiements et suivi avancé de l'activité.",
    features: PRO_PLAN_MARKETING_FEATURES,
    price: "39 € / mois",
    ctaLabel: "Choisir Pro",
    ctaFootnote: LAUNCH_OFFER.foundersProFootnote,
    disabled: false,
  },
];

import type { SubscriptionPlan } from "@/lib/billing/types";

/** Wording public — offre de lancement (plan interne DB : `beta`). */
export const LAUNCH_OFFER = {
  name: "Offre de lancement",
  earlyAccess: "Accès anticipé",
  foundersPro: "Plan Pro offert aux membres fondateurs",
  foundersProFootnote:
    "Le plan Pro est offert pendant la phase de lancement aux premiers professionnels utilisant Factoni.",
  noCardRequired: "Aucune carte bancaire requise pendant l'offre de lancement.",
  signupHint: "Plan Pro offert aux membres fondateurs — accès anticipé.",
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
  features: string[];
}

/** Offres affichées sur la landing */
export const PUBLIC_PRICING_PLANS: PlanMarketingInfo[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Le plus populaire",
    tagline: "Pour facturer au quotidien",
    description:
      "L'essentiel pour les indépendants qui veulent des factures pro, sans friction.",
    priceLabel: "19 €",
    priceSuffix: "/ mois",
    highlighted: true,
    ctaLabel: "Commencer gratuitement",
    features: [
      "Factures & clients illimités",
      "PDF pro avec votre logo",
      "Numérotation légale automatique",
      "Exports comptables CSV",
      "Sans branding Factoni",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Professionnels",
    tagline: "Automatisation & suivi avancé",
    description:
      "Relances, analytics et automatisations pour structurer votre activité.",
    priceLabel: "39 €",
    priceSuffix: "/ mois",
    ctaLabel: "Accès fondateurs",
    ctaFootnote: LAUNCH_OFFER.foundersProFootnote,
    features: [
      "Tout Starter inclus",
      "Relances automatiques",
      "Suivi & analytics avancés",
      "Portail client premium",
      "Automatisations métier",
    ],
  },
];

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
  features: string[];
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
    description: "Pour les indépendants qui facturent régulièrement.",
    features: [
      "Factures illimitées",
      "Clients illimités",
      "Logo personnalisé",
      "Exports comptables",
      "Branding supprimé",
    ],
    price: "19 € / mois",
    highlighted: true,
    ctaLabel: "Choisir Starter",
    disabled: false,
  },
  {
    id: "pro",
    tierBadge: "Professionnels",
    name: "Pro",
    description: "Pour automatiser relances et suivi avancé.",
    features: [
      "Tout Starter inclus",
      "Relances automatiques",
      "Analytics avancées",
      "Portail client",
      "Automatisations",
    ],
    price: "39 € / mois",
    ctaLabel: "Choisir Pro",
    ctaFootnote: LAUNCH_OFFER.foundersProFootnote,
    disabled: false,
  },
];

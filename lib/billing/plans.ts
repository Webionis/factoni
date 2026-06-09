import type { SubscriptionPlan } from "@/lib/billing/types";

export interface PlanMarketingInfo {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  priceSuffix?: string;
  highlighted?: boolean;
  ctaLabel: string;
  features: string[];
}

/** Offres affichées sur la landing (futur — pas de paiement) */
export const PUBLIC_PRICING_PLANS: PlanMarketingInfo[] = [
  {
    id: "free",
    name: "Gratuit",
    tagline: "Pour démarrer simplement",
    description:
      "L'essentiel pour tester Factoni avec un volume modeste de factures et clients.",
    priceLabel: "0 €",
    priceSuffix: "/ mois",
    ctaLabel: "Bientôt disponible",
    features: [
      "Jusqu'à 10 factures",
      "Jusqu'à 5 clients",
      "PDF avec mention Factoni",
      "Fonctionnalités essentielles",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Offre professionnelle principale",
    description:
      "Pour les indépendants qui facturent régulièrement et veulent une image pro.",
    priceLabel: "—",
    priceSuffix: "prix annoncé avant lancement",
    highlighted: true,
    ctaLabel: "Bientôt disponible",
    features: [
      "Factures & clients illimités",
      "Logo personnalisé",
      "Sans branding Factoni",
      "Exports comptables",
      "Analytics simples",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Automatisation & gestion avancée",
    description:
      "Pour une activité plus structurée : relances, suivi avancé et automatisations.",
    priceLabel: "—",
    priceSuffix: "prix annoncé avant lancement",
    ctaLabel: "Bientôt disponible",
    features: [
      "Tout Starter inclus",
      "Relances automatiques",
      "Suivi & analytics avancés",
      "Automatisations",
      "Fonctionnalités premium à venir",
    ],
  },
];

export const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  beta: "Bêta gratuite",
  free: "Gratuit",
  starter: "Starter",
  pro: "Pro",
};

/** Config cartes — page app /settings/billing */
export interface BillingPlanCardConfig {
  id: Exclude<SubscriptionPlan, "beta">;
  tierBadge: string;
  name: string;
  description: string;
  features: string[];
  footerNote?: string;
  ctaLabel: string;
  highlighted?: boolean;
  recommended?: boolean;
  futurePrice?: string;
  disabled: boolean;
}

export const BILLING_PAGE_PLANS: BillingPlanCardConfig[] = [
  {
    id: "free",
    tierBadge: "Essentiel",
    name: "Gratuit",
    description: "Pour démarrer simplement.",
    features: [
      "Factures limitées",
      "Clients limités",
      "PDF standard",
      "Fonctionnalités essentielles",
    ],
    footerNote: "Disponible après la bêta",
    ctaLabel: "Offre future",
    disabled: true,
  },
  {
    id: "starter",
    tierBadge: "Professionnel",
    name: "Starter",
    description: "Pour les indépendants réguliers.",
    features: [
      "Factures illimitées",
      "Clients illimités",
      "Logo personnalisé",
      "Exports comptables",
      "Branding supprimé",
    ],
    highlighted: true,
    recommended: true,
    ctaLabel: "Disponible bientôt",
    disabled: true,
  },
  {
    id: "pro",
    tierBadge: "Automatisation",
    name: "Pro",
    description: "Pour automatiser et gagner du temps.",
    features: [
      "Tout Starter inclus",
      "Relances automatiques",
      "Analytics avancées",
      "Automatisations",
      "Suivi avancé",
    ],
    ctaLabel: "Disponible bientôt",
    disabled: true,
  },
];

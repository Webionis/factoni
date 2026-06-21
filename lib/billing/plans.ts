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

export interface LandingFaqItem {
  q: string;
  a: string;
}

const LANDING_FAQ_TAIL: LandingFaqItem[] = [
  {
    q: "L'agenda est-il inclus ?",
    a: "Oui, dès l'offre Starter. Planifiez vos rendez-vous, consultez votre semaine et retrouvez vos prochains créneaux depuis le tableau de bord.",
  },
  {
    q: "Puis-je créer des devis ?",
    a: "Oui, les devis sont illimités dès Starter : création, PDF, envoi et conversion en facture. La signature en ligne et le portail client sont réservés au plan Pro.",
  },
  {
    q: "Factoni est-il prêt pour la facturation électronique 2026 ?",
    a: "Factoni structure vos factures avec numérotation légale, mentions conformes et export comptable — les briques essentielles pour accompagner la réforme. Les évolutions réglementaires seront intégrées au fil de la mise en conformité.",
  },
  {
    q: "Puis-je facturer depuis mon téléphone ?",
    a: "Oui. L'interface est pensée mobile-first : clients, lignes, TVA et PDF en quelques taps, même sur chantier.",
  },
  {
    q: "Quand obtient-on le numéro de facture légal ?",
    a: "Au passage au statut « Envoyée ». En brouillon, la facture n'a pas de numéro FF-YYYY-NNNNNN.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "En Europe, via une infrastructure cloud sécurisée. Chaque compte est isolé : authentification Supabase, RLS sur chaque table, logos en bucket privé.",
  },
  {
    q: "Puis-je exporter mes factures pour mon comptable ?",
    a: "Oui, dès Starter. Export CSV de vos factures (et données associées) depuis les réglages, pour faciliter le suivi comptable.",
  },
  {
    q: "Quelles fonctionnalités sont dans le plan Pro ?",
    a: "Relances automatiques, analytics avancés, signature de devis en ligne, portail client, paiements Stripe (acomptes & factures), automatisations et préparation à la facturation électronique.",
  },
];

export function getLandingFaq(): LandingFaqItem[] {
  const pricingAnswer = isProductionLaunchActive()
    ? "Starter à 19 €/mois (devis, factures, clients, agenda, exports) et Pro à 39 €/mois (relances auto, signatures, paiements en ligne, analytics). Commencez gratuitement (10 factures et 5 clients), puis souscrivez à Starter ou Pro depuis votre espace."
    : "Starter à 19 €/mois (devis, factures, clients, agenda, exports) et Pro à 39 €/mois (relances auto, signatures, paiements en ligne, analytics). Pendant l'offre de lancement, le plan Pro est offert aux membres fondateurs — accès anticipé, sans carte bancaire.";

  return [
    { q: "Quels sont les tarifs ?", a: pricingAnswer },
    ...LANDING_FAQ_TAIL,
  ];
}

export function getLandingTestimonialsLead(): string {
  return isProductionLaunchActive()
    ? "Artisans et indépendants qui simplifient leur facturation — noms modifiés."
    : "Artisans et indépendants en accès anticipé — noms modifiés.";
}

export function getLandingHeroTrustPills(): readonly string[] {
  return isProductionLaunchActive()
    ? (["Gratuit pour débuter", "Hébergement EU", "PDF conforme"] as const)
    : (["Sans carte", "Hébergement EU", "PDF conforme"] as const);
}

export function getLandingHeroFootnote(): string {
  return isProductionLaunchActive()
    ? "Offre gratuite · Passez à Starter ou Pro quand vous voulez"
    : "Offre de lancement · Accès anticipé";
}

export function getLandingFinalCtaTrustPointsMobile(): readonly string[] {
  return isProductionLaunchActive()
    ? (["Gratuit pour débuter", "Mentions légales conformes", "Export comptable CSV"] as const)
    : (["Offre de lancement — sans carte", "Mentions légales conformes", "Export comptable CSV"] as const);
}

export function getLandingFinalCtaTrustPointsDesktop(): readonly string[] {
  return isProductionLaunchActive()
    ? ([
        "Configuration en moins d'une minute",
        "Offre gratuite · upgrade Starter ou Pro à tout moment",
        "Numérotation légale automatique à l'envoi",
        "Hébergement Europe · sauvegardes automatiques",
      ] as const)
    : ([
        "Configuration en moins d'une minute",
        "Offre de lancement — sans carte bancaire",
        "Numérotation légale automatique à l'envoi",
        "Hébergement Europe · sauvegardes automatiques",
      ] as const);
}

export function getLandingFinalCtaPills(): readonly string[] {
  return isProductionLaunchActive()
    ? (["Gratuit pour débuter", "Export CSV", "Mentions légales"] as const)
    : (["Sans carte", "Export CSV", "Mentions légales"] as const);
}

export function getLandingFinalCtaFootnote(): string {
  return isProductionLaunchActive()
    ? "Utilisé par des artisans, consultants et TPE en France"
    : "Déjà utilisé par des artisans, consultants et TPE en accès anticipé";
}

export function getLandingFeaturesCtaEyebrow(): string {
  return isProductionLaunchActive()
    ? "Commencez gratuitement"
    : "Offre de lancement";
}

export function getMarketingFooterBadge(): string {
  return isProductionLaunchActive()
    ? "Gratuit pour débuter · Starter & Pro disponibles"
    : "Offre de lancement · Accès anticipé";
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

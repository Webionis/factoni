export type LegalSubprocessor = {
  name: string;
  purpose: string;
  websiteUrl: string;
  websiteLabel: string;
  /** Non déployé sur toutes les instances */
  optional?: boolean;
};

/** Sous-traitants techniques — source unique pour la politique de confidentialité. */
export const LEGAL_SUBPROCESSORS: LegalSubprocessor[] = [
  {
    name: "Supabase, Inc.",
    purpose:
      "Authentification, base de données, stockage des fichiers (logos, signatures)",
    websiteUrl: "https://supabase.com",
    websiteLabel: "supabase.com",
  },
  {
    name: "Vercel Inc.",
    purpose: "Hébergement du site web et de l'application",
    websiteUrl: "https://vercel.com",
    websiteLabel: "vercel.com",
  },
  {
    name: "Stripe, Inc.",
    purpose:
      "Paiement des abonnements Factoni (Starter / Pro) et, le cas échéant, Stripe Connect pour les paiements de vos clients",
    websiteUrl: "https://stripe.com",
    websiteLabel: "stripe.com",
  },
  {
    name: "Resend, Inc.",
    purpose:
      "Envoi d'emails transactionnels (relances automatiques, notifications de paiement ou de signature)",
    websiteUrl: "https://resend.com",
    websiteLabel: "resend.com",
  },
  {
    name: "Functional Software, Inc. (Sentry)",
    purpose: "Suivi des erreurs techniques (si activé sur l'instance)",
    websiteUrl: "https://sentry.io",
    websiteLabel: "sentry.io",
    optional: true,
  },
];

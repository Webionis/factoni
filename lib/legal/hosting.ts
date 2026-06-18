export type LegalHostingProvider = {
  name: string;
  role: string;
  address: string;
  websiteUrl: string;
  websiteLabel: string;
};

export const SITE_HOSTING: LegalHostingProvider = {
  name: "Vercel Inc.",
  role: "Hébergement du site web et de l'application",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  websiteUrl: "https://vercel.com",
  websiteLabel: "vercel.com",
};

export const DATA_HOSTING: LegalHostingProvider = {
  name: "Supabase, Inc.",
  role: "Hébergement des données (base de données, authentification, fichiers)",
  address:
    "970 Toa Payoh North #07-04, Singapore 318992 — infrastructure déployée en région Union européenne lorsque configurée",
  websiteUrl: "https://supabase.com",
  websiteLabel: "supabase.com",
};

export const PAYMENT_PROVIDER = {
  name: "Stripe, Inc.",
  role: "Traitement des paiements d'abonnement (Factoni Starter / Pro)",
  websiteUrl: "https://stripe.com",
  websiteLabel: "stripe.com",
} as const;

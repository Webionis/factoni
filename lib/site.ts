export const siteConfig = {
  name: "Factoni",
  /** Titre Open Graph / partage social (≠ titre d’onglet navigateur). */
  ogTitle: "Factoni — Facturation moderne pour professionnels",
  description:
    "Factoni simplifie les devis, factures et relances pour artisans, indépendants et petites entreprises.",
  tagline: "La facturation moderne pour les professionnels.",
  subtagline: "Devis, factures et relances simplifiés.",
  locale: "fr_FR",
  productionUrl: "https://factoni.fr",
  secondaryUrl: "https://factoni.com",
  get url(): string {
    return (
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000"
    );
  },
} as const;

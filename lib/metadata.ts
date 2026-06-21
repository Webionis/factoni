import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

/** Nom de marque affiché en suffixe d’onglet. */
export const siteTitle = siteConfig.name;

/** Template root layout : « [Page] - Factoni » */
export const titleTemplate = `%s - ${siteTitle}`;

/**
 * Segments de titre par page (partie avant « - Factoni »).
 * Source unique — ne pas dupliquer les libellés dans les pages.
 */
export const pageTitles = {
  home: "Accueil",
  login: "Connexion",
  signup: "Créer un compte",
  forgotPassword: "Mot de passe oublié",
  dashboard: "Tableau de bord",
  quotes: "Devis",
  quoteNew: "Nouveau devis",
  quoteDetail: "Devis",
  quoteEdit: "Modifier le devis",
  invoices: "Factures",
  invoiceNew: "Nouvelle facture",
  invoiceDetail: "Facture",
  invoiceEdit: "Modifier la facture",
  clients: "Clients",
  clientNew: "Nouveau client",
  clientDetail: "Client",
  clientEdit: "Modifier le client",
  company: "Mon entreprise",
  billing: "Abonnement",
  payments: "Paiements",
  exports: "Exports",
  catalog: "Catalogue prestations",
  einvoicing: "Facturation électronique",
  agenda: "Agenda",
  onboarding: "Configuration",
  legalNotice: "Mentions légales",
  privacy: "Confidentialité",
  termsOfUse: "CGU",
  termsOfSale: "CGV",
} as const;

export type PageTitleKey = keyof typeof pageTitles;

/** Metadata page — le template du root layout ajoute « - Factoni ». */
export function pageMetadata(
  key: PageTitleKey,
  options?: Omit<Metadata, "title">,
): Metadata {
  return {
    title: pageTitles[key],
    ...options,
  };
}

/** Metadata page avec titre dynamique (détail facture, client, etc.). */
export function createPageMetadata(
  title: string,
  options?: Omit<Metadata, "title">,
): Metadata {
  return {
    title,
    ...options,
  };
}

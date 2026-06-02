/** Taux TVA français supportés au MVP */
export const FRENCH_VAT_RATES = [0, 5.5, 10, 20] as const;

export type FrenchVatRate = (typeof FRENCH_VAT_RATES)[number];

export const VAT_REGIMES = [
  "standard",
  "franchise_base",
] as const;

export type VatRegime = (typeof VAT_REGIMES)[number];

export const FRANCHISE_MENTION =
  "TVA non applicable, art. 293 B du CGI";

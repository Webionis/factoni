/** Options prédéfinies — conditions de paiement sur les factures. */
export const PAYMENT_TERMS_PRESETS = [
  "Virement bancaire",
  "Carte bancaire",
  "Espèces",
  "Chèque",
  "Prélèvement bancaire",
  "PayPal",
  "Paiement comptant",
  "Paiement à réception",
  "Paiement à 30 jours",
  "Paiement à 45 jours",
  "Paiement à 60 jours",
] as const;

export type PaymentTermsPreset = (typeof PAYMENT_TERMS_PRESETS)[number];

export const DEFAULT_INVOICE_PAYMENT_TERM: PaymentTermsPreset =
  "Virement bancaire";

export const PAYMENT_TERMS_OTHER_LABEL = "Autre (à préciser)";
export const PAYMENT_TERMS_OTHER_VALUE = "__payment_terms_other__";

export function isKnownPaymentTerm(
  value: string,
): value is PaymentTermsPreset {
  return (PAYMENT_TERMS_PRESETS as readonly string[]).includes(value);
}

/** Valeur stockée → état du select + champ libre éventuel. */
export function splitPaymentTermsForForm(stored: string | null | undefined): {
  preset: string;
  customOther: string;
} {
  const value = (stored ?? "").trim();
  if (!value) {
    return {
      preset: DEFAULT_INVOICE_PAYMENT_TERM,
      customOther: "",
    };
  }
  if (isKnownPaymentTerm(value)) {
    return { preset: value, customOther: "" };
  }
  return { preset: PAYMENT_TERMS_OTHER_VALUE, customOther: value };
}

/** Select (+ champ Autre) → valeur enregistrée en base. */
export function mergePaymentTermsForSubmit(
  preset: string,
  customOther: string,
): string {
  if (preset === PAYMENT_TERMS_OTHER_VALUE) {
    return customOther.trim();
  }
  return preset;
}

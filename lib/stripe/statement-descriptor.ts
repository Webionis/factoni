/** Nom affiché sur 3DS / relevé bancaire (5–22 car., lettres/chiffres). */
export const STRIPE_STATEMENT_SUFFIX = "FACTONI";

export function getCheckoutPaymentIntentDescriptorData(): {
  statement_descriptor_suffix: string;
} {
  return { statement_descriptor_suffix: STRIPE_STATEMENT_SUFFIX };
}

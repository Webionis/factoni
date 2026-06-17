import {
  recoverSubscriptionForUser,
  syncFromCheckoutSessionId,
} from "@/lib/billing/stripe/sync";
import { logServerError } from "@/lib/logger";

export type BillingCheckoutCompletion = "synced" | "pending";

/**
 * Active l'abonnement dès le retour Stripe Checkout (sans attendre le webhook).
 */
export async function completeBillingCheckoutReturn(
  userId: string,
  email: string,
  sessionId: string,
): Promise<BillingCheckoutCompletion> {
  try {
    await syncFromCheckoutSessionId(sessionId, userId);
    return "synced";
  } catch (error) {
    logServerError("billing.checkout_return.sync", error, { userId, sessionId });
  }

  try {
    const recovered = await recoverSubscriptionForUser(userId, email);
    return recovered ? "synced" : "pending";
  } catch (error) {
    logServerError("billing.checkout_return.recover", error, { userId, sessionId });
    return "pending";
  }
}

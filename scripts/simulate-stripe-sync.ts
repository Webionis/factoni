/**
 * Simule le retour Stripe success (sync checkout session) pour valider le flux complet.
 * Usage: npx tsx scripts/simulate-stripe-sync.ts <checkout_session_id>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

import { applyInvoicePaidFromCheckoutSession } from "../lib/invoices/mark-paid-from-stripe";
import { runInvoicePaidSideEffects } from "../lib/invoices/schedule-invoice-paid-side-effects";
import { getStripeClient, isStripeConfigured } from "../lib/stripe/client";

const sessionId = process.argv[2]?.trim();

if (!sessionId) {
  console.error("Usage: npx tsx scripts/simulate-stripe-sync.ts <checkout_session_id>");
  process.exit(1);
}

if (!isStripeConfigured()) {
  console.error("❌ STRIPE_SECRET_KEY manquant");
  process.exit(1);
}

async function main() {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  console.log("→ Session", {
    id: session.id,
    payment_status: session.payment_status,
    metadata: session.metadata,
  });

  const result = await applyInvoicePaidFromCheckoutSession(
    session,
    `sync_checkout_${sessionId}`,
  );

  console.log("→ applyInvoicePaidFromCheckoutSession", result);

  if (result.invoiceId) {
    console.log("→ Attente effets secondaires (hors Next.js after)…");
    await runInvoicePaidSideEffects(result.invoiceId, {
      source: "simulate_stripe_sync",
      transitioned: result.transitioned ?? false,
    });
  }

  console.log("→ Terminé");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

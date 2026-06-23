import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { STRIPE_STATEMENT_SUFFIX } from "@/lib/stripe/statement-descriptor";

const LEGACY_DESCRIPTOR_MARKERS = ["ELITE", "TRADING", "ELITETRADING"];

/** Évite de rappeler Stripe à chaque checkout (TTL 10 min). */
let lastEnsuredAt = 0;
const ENSURE_TTL_MS = 10 * 60 * 1000;

function needsDescriptorUpdate(descriptor: string | null | undefined): boolean {
  if (!descriptor?.trim()) return true;
  const normalized = descriptor.trim().toUpperCase();
  if (normalized === STRIPE_STATEMENT_SUFFIX) return false;
  return LEGACY_DESCRIPTOR_MARKERS.some((marker) => normalized.includes(marker));
}

async function ensureAccountDescriptor(stripe: Stripe): Promise<void> {
  const account = await stripe.accounts.retrieve(null);
  const current = account.settings?.payments?.statement_descriptor;

  if (!needsDescriptorUpdate(current)) return;

  await stripe.accounts.update(account.id, {
    settings: {
      payments: {
        statement_descriptor: STRIPE_STATEMENT_SUFFIX,
      },
    },
  });
}

async function ensureProductDescriptor(
  stripe: Stripe,
  productId: string,
): Promise<void> {
  const product = await stripe.products.retrieve(productId);
  if (product.deleted) return;

  if (!needsDescriptorUpdate(product.statement_descriptor)) return;

  await stripe.products.update(product.id, {
    statement_descriptor: STRIPE_STATEMENT_SUFFIX,
  });
}

/**
 * Corrige le descripteur 3DS / relevé bancaire (Revolut affiche souvent
 * le descripteur PRODUIT pour les abonnements).
 * Idempotent — safe à appeler avant chaque Checkout.
 */
export async function ensureStripePaymentDescriptors(
  priceId?: string | null,
): Promise<void> {
  const now = Date.now();
  if (now - lastEnsuredAt < ENSURE_TTL_MS) return;

  const stripe = getStripeClient();

  await ensureAccountDescriptor(stripe);

  const productIds = new Set<string>();

  if (priceId?.trim()) {
    const price = await stripe.prices.retrieve(priceId.trim(), {
      expand: ["product"],
    });
    const productRef = price.product;
    const productId =
      typeof productRef === "string" ? productRef : productRef?.id;
    if (productId) productIds.add(productId);
  }

  const products = await stripe.products.list({ active: true, limit: 100 });
  for (const product of products.data) {
    productIds.add(product.id);
  }

  for (const productId of productIds) {
    await ensureProductDescriptor(stripe, productId);
  }

  lastEnsuredAt = now;
}

#!/usr/bin/env node
/**
 * Diagnostic Stripe Connect Express — exécution locale uniquement.
 * Usage : node scripts/diagnose-stripe-connect.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
      .filter(([key]) => key),
  );
}

const env = { ...loadEnvFile(envPath), ...process.env };
const secretKey = env.STRIPE_SECRET_KEY?.trim();
const publishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
const appUrl = (env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

function maskKey(key) {
  if (!key) return "(absent)";
  if (key.length < 12) return "***";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

function printStripeError(label, error) {
  console.error(`\n❌ ${label}`);
  if (error && typeof error === "object") {
    const e = /** @type {Record<string, unknown>} */ (error);
    if (e.type) console.error("   type:", e.type);
    if (e.code) console.error("   code:", e.code);
    if (e.message) console.error("   message:", e.message);
    if (e.param) console.error("   param:", e.param);
    if (e.doc_url) console.error("   doc_url:", e.doc_url);
    if (e.raw && typeof e.raw === "object") {
      const raw = /** @type {Record<string, unknown>} */ (e.raw);
      if (raw.message) console.error("   raw.message:", raw.message);
    }
    if (error instanceof Error && error.stack) {
      console.error("   stack:", error.stack.split("\n").slice(0, 4).join("\n"));
    }
  } else {
    console.error("   ", error);
  }
}

console.log("=== Diagnostic Stripe Connect ===\n");
console.log("STRIPE_SECRET_KEY:", maskKey(secretKey), secretKey?.startsWith("sk_test_") ? "(test)" : secretKey?.startsWith("sk_live_") ? "(LIVE ⚠️)" : "(format inconnu)");
console.log("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:", maskKey(publishableKey), publishableKey?.startsWith("pk_test_") ? "(test)" : publishableKey?.startsWith("pk_live_") ? "(LIVE ⚠️)" : "(format inconnu)");

if (secretKey && publishableKey) {
  const skMode = secretKey.includes("_test_") ? "test" : "live";
  const pkMode = publishableKey.includes("_test_") ? "test" : "live";
  console.log("Mode cohérent:", skMode === pkMode ? `✅ ${skMode}` : `❌ secret=${skMode} publishable=${pkMode}`);
  if (secretKey.slice(8, 24) !== publishableKey.slice(8, 24)) {
    console.log("⚠️  Les clés semblent provenir de comptes Stripe différents (préfixes différents)");
  }
}

console.log("NEXT_PUBLIC_APP_URL:", appUrl);
const refreshUrl = `${appUrl}/settings/payments`;
const returnUrl = `${appUrl}/settings/payments/stripe/callback`;
console.log("refresh_url:", refreshUrl);
console.log("return_url:", returnUrl);

if (!secretKey) {
  console.error("\n❌ STRIPE_SECRET_KEY manquant");
  process.exit(1);
}

const stripe = new Stripe(secretKey, { typescript: true });

let accountId = null;

try {
  console.log("\n--- Étape 1 : accounts.create (type: express) ---");
  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email: "diagnostic@factoni.fr",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { factoni_diagnostic: "true" },
  });
  accountId = account.id;
  console.log("✅ Compte créé:", account.id, "| type:", account.type);
} catch (error) {
  printStripeError("accounts.create a échoué", error);
  process.exit(1);
}

try {
  console.log("\n--- Étape 2 : accountLinks.create ---");
  console.log("   account:", accountId);
  console.log("   type: account_onboarding");
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  console.log("✅ Account Link créé:", link.url?.slice(0, 80) + "…");
} catch (error) {
  printStripeError("accountLinks.create a échoué", error);
  process.exit(1);
}

console.log("\n🎉 Flow Stripe Connect OK en local (hors auth Supabase).");

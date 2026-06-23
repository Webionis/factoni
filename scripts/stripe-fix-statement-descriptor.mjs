#!/usr/bin/env node
/**
 * Met à jour le descripteur de relevé Stripe (3DS Revolut / relevé bancaire).
 *
 * Usage :
 *   node scripts/stripe-fix-statement-descriptor.mjs
 *   node scripts/stripe-fix-statement-descriptor.mjs --dry-run
 *
 * Lit STRIPE_SECRET_KEY + price IDs depuis .env.production ou .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const DESCRIPTOR = "FACTONI";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const result = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadEnv() {
  for (const name of [".env.production", ".env.local"]) {
    const fileEnv = loadEnvFile(path.join(root, name));
    if (Object.keys(fileEnv).length > 0) {
      return { ...fileEnv, ...process.env, loadedFrom: name };
    }
  }
  return { ...process.env, loadedFrom: null };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const inspectOnly = process.argv.includes("--inspect");
  const { loadedFrom, ...env } = loadEnv();
  const secretKey = env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    console.error("❌ STRIPE_SECRET_KEY manquant (.env.production ou .env.local)");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const mode = secretKey.startsWith("sk_live_") ? "LIVE" : "TEST";

  console.log(`\n═══ Descripteur Stripe → ${DESCRIPTOR} (${mode}) ═══`);
  if (loadedFrom) console.log(`Env : ${loadedFrom}`);
  if (dryRun) console.log("Mode : dry-run");
  if (inspectOnly) console.log("Mode : inspect (aucune modification)");

  const account = await stripe.accounts.retrieve();
  console.log(`Compte Stripe : ${account.id}`);

  const payments = account.settings?.payments;
  const currentDescriptor = payments?.statement_descriptor ?? "(non défini)";

  console.log(`\n── Compte ──`);
  console.log(`Nom dashboard   : ${account.settings?.dashboard?.display_name ?? "—"}`);
  console.log(`Business profile: ${account.business_profile?.name ?? "—"}`);
  console.log(`Descripteur     : ${currentDescriptor}`);

  console.log(`\n── Tous les produits actifs ──`);
  const products = await stripe.products.list({ active: true, limit: 100 });
  if (products.data.length === 0) {
    console.log("(aucun produit actif)");
  }
  for (const product of products.data) {
    const desc = product.statement_descriptor ?? "(non défini → hérite du compte)";
    const marker = desc.includes("ELITE") || desc.includes("TRADING") ? " ⚠️" : desc === DESCRIPTOR ? " ✅" : "";
    console.log(`• ${product.name} [${product.id}]`);
    console.log(`  Descripteur produit : ${desc}${marker}`);
  }

  if (inspectOnly) {
    console.log(
      "\n💡 Revolut affiche le descripteur du PRODUIT en priorité pour les abonnements.",
    );
    console.log("   Si un produit affiche encore ELITETRADING…, corrigez-le ci-dessus.\n");
    return;
  }

  if (currentDescriptor !== DESCRIPTOR) {
    if (dryRun) {
      console.log(`\n→ Mettrait à jour le descripteur compte → ${DESCRIPTOR}`);
    } else {
      await stripe.accounts.update(account.id, {
        settings: {
          payments: {
            statement_descriptor: DESCRIPTOR,
          },
        },
      });
      console.log(`\n✅ Descripteur compte → ${DESCRIPTOR}`);
    }
  } else {
    console.log("\n✅ Descripteur compte déjà OK");
  }

  const priceIds = [
    env.STRIPE_PRICE_STARTER_MONTHLY?.trim(),
    env.STRIPE_PRICE_PRO_MONTHLY?.trim(),
  ].filter(Boolean);

  const productIdsToUpdate = new Set(products.data.map((p) => p.id));

  if (priceIds.length > 0) {
    for (const priceId of priceIds) {
      const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
      const productId =
        typeof price.product === "string" ? price.product : price.product?.id;
      if (productId) productIdsToUpdate.add(productId);
    }
  }

  for (const productId of productIdsToUpdate) {
    const product = await stripe.products.retrieve(productId);
    if (product.deleted) continue;

    const productDescriptor = product.statement_descriptor ?? "(non défini)";
    console.log(`\nProduit ${product.name} (${product.id})`);
    console.log(`  Descripteur : ${productDescriptor}`);

    if (productDescriptor !== DESCRIPTOR) {
      if (dryRun) {
        console.log(`  → Mettrait à jour → ${DESCRIPTOR}`);
      } else {
        await stripe.products.update(product.id, {
          statement_descriptor: DESCRIPTOR,
        });
        console.log(`  ✅ Mis à jour → ${DESCRIPTOR}`);
      }
    } else {
      console.log("  ✅ Déjà OK");
    }
  }

  console.log("\n✅ Terminé. Refaites un paiement test (navigation privée).\n");
}

main().catch((error) => {
  console.error("\n❌", error.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Met à jour le descripteur de relevé Stripe (3DS Revolut / relevé bancaire).
 *
 * Usage :
 *   node scripts/stripe-fix-statement-descriptor.mjs
 *   node scripts/stripe-fix-statement-descriptor.mjs --dry-run
 *   STRIPE_SECRET_KEY=sk_live_... npm run stripe:fix-descriptor
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
const LEGACY_MARKERS = ["ELITE", "TRADING", "ELITETRADING"];

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

function needsUpdate(descriptor) {
  if (!descriptor?.trim()) return true;
  const normalized = descriptor.trim().toUpperCase();
  if (normalized === DESCRIPTOR) return false;
  return LEGACY_MARKERS.some((marker) => normalized.includes(marker));
}

function printDashboardAccountHint(mode) {
  const base =
    mode === "LIVE"
      ? "https://dashboard.stripe.com/settings/public"
      : "https://dashboard.stripe.com/test/settings/public";
  console.log("\n── Descripteur compte (Dashboard Stripe — OBLIGATOIRE si promo 0 €) ──");
  console.log(
    "Avec un code promo 100 % (BIENVENUE), Revolut affiche le descripteur COMPTE, pas le produit.",
  );
  console.log("1. Basculez en mode LIVE (interrupteur en haut à droite du Dashboard)");
  console.log(`2. Ouvrez : ${base}`);
  console.log(`3. Descripteur de relevé bancaire → ${DESCRIPTOR} (max 22 caractères)`);
  console.log(`4. Nom public / DBA → Factoni`);
  console.log("5. Enregistrez, attendez 2–3 min, retestez en navigation privée");
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

  const account = await stripe.accounts.retrieve(null);
  console.log(`Compte Stripe : ${account.id}`);

  const payments = account.settings?.payments;
  const cardPayments = account.settings?.card_payments;
  const currentDescriptor = payments?.statement_descriptor ?? "(non défini)";
  const prefixDescriptor =
    cardPayments?.statement_descriptor_prefix ?? "(non défini)";

  console.log(`\n── Compte ──`);
  console.log(`Nom dashboard   : ${account.settings?.dashboard?.display_name ?? "—"}`);
  console.log(`Business profile: ${account.business_profile?.name ?? "—"}`);
  console.log(`Descripteur     : ${currentDescriptor}`);
  console.log(`Préfixe carte   : ${prefixDescriptor}`);

  console.log(`\n── Tous les produits actifs ──`);
  const products = await stripe.products.list({ active: true, limit: 100 });
  if (products.data.length === 0) {
    console.log("(aucun produit actif)");
  }
  for (const product of products.data) {
    const desc = product.statement_descriptor ?? "(non défini → hérite du compte)";
    const marker =
      desc.includes("ELITE") || desc.includes("TRADING")
        ? " ⚠️"
        : desc === DESCRIPTOR
          ? " ✅"
          : desc.includes("non défini")
            ? " ℹ️"
            : "";
    console.log(`• ${product.name} [${product.id}]`);
    console.log(`  Descripteur produit : ${desc}${marker}`);
  }

  console.log(`\n── Profil entreprise ──`);
  console.log(`URL site    : ${account.business_profile?.url ?? "—"}`);
  console.log(`Nom public  : ${account.business_profile?.name ?? "—"}`);

  if (inspectOnly) {
    console.log(
      "\n💡 Revolut affiche le descripteur du PRODUIT en priorité pour les abonnements.",
    );
    if (needsUpdate(currentDescriptor)) {
      printDashboardAccountHint(mode);
    }
    console.log("");
    return;
  }

  if (needsUpdate(currentDescriptor)) {
    if (dryRun) {
      console.log(`\n→ Descripteur compte : mise à jour Dashboard recommandée → ${DESCRIPTOR}`);
    } else {
      try {
        await stripe.accounts.update(account.id, {
          settings: {
            payments: {
              statement_descriptor: DESCRIPTOR,
            },
          },
        });
        console.log(`\n✅ Descripteur compte → ${DESCRIPTOR}`);
      } catch (error) {
        console.log(
          `\n⚠️  Descripteur compte non modifiable via API (${error.message})`,
        );
        printDashboardAccountHint(mode);
      }
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

  console.log("\n── Mise à jour des produits (API) ──");
  let productsUpdated = 0;

  for (const productId of productIdsToUpdate) {
    const product = await stripe.products.retrieve(productId);
    if (product.deleted) continue;

    const productDescriptor = product.statement_descriptor;
    console.log(`\nProduit ${product.name} (${product.id})`);
    console.log(
      `  Descripteur : ${productDescriptor ?? "(non défini → hérite du compte)"}`,
    );

    if (needsUpdate(productDescriptor)) {
      if (dryRun) {
        console.log(`  → Mettrait à jour → ${DESCRIPTOR}`);
      } else {
        await stripe.products.update(product.id, {
          statement_descriptor: DESCRIPTOR,
        });
        console.log(`  ✅ Mis à jour → ${DESCRIPTOR}`);
        productsUpdated++;
      }
    } else {
      console.log("  ✅ Déjà OK");
    }
  }

  if (!dryRun && productsUpdated > 0) {
    console.log(
      `\n✅ ${productsUpdated} produit(s) mis à jour — utile pour les paiements > 0 €.`,
    );
  }

  if (
    needsUpdate(currentDescriptor) ||
    needsUpdate(cardPayments?.statement_descriptor_prefix)
  ) {
    printDashboardAccountHint(mode);
  }

  console.log(
    `\n💡 Mode ${mode} : les réglages TEST et LIVE sont séparés.`,
  );
  console.log("\n✅ Terminé. Refaites un paiement test (navigation privée).\n");
}

main().catch((error) => {
  console.error("\n❌", error.message);
  process.exit(1);
});

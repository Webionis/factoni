#!/usr/bin/env node
/**
 * Vérifie la config locale Stripe Connect avant tests manuels.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");
const stripeCli = path.join(root, "tools/stripe");

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
const checks = [];

function ok(label) {
  checks.push({ label, ok: true });
  console.log(`✅ ${label}`);
}

function fail(label, hint = "") {
  checks.push({ label, ok: false });
  console.log(`❌ ${label}${hint ? ` — ${hint}` : ""}`);
}

const secret = env.STRIPE_SECRET_KEY?.trim();
const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
const webhook = env.STRIPE_WEBHOOK_SECRET?.trim();
const appUrl = env.NEXT_PUBLIC_APP_URL?.trim();

if (secret?.startsWith("sk_test_")) ok("STRIPE_SECRET_KEY (test)");
else fail("STRIPE_SECRET_KEY (sk_test_…)", "Dashboard Stripe → Developers → API keys");

if (publishable?.startsWith("pk_test_")) ok("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test)");
else fail("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_…)");

if (webhook?.startsWith("whsec_")) ok("STRIPE_WEBHOOK_SECRET");
else fail("STRIPE_WEBHOOK_SECRET (whsec_…)", "stripe listen (voir npm run stripe:listen)");

if (appUrl) ok(`NEXT_PUBLIC_APP_URL = ${appUrl}`);
else fail("NEXT_PUBLIC_APP_URL");

if (fs.existsSync(stripeCli)) ok("Stripe CLI (tools/stripe)");
else fail("Stripe CLI", "relancer le téléchargement dans tools/");

if (env.SUPABASE_SERVICE_ROLE_KEY) ok("SUPABASE_SERVICE_ROLE_KEY");
else fail("SUPABASE_SERVICE_ROLE_KEY");

if (env.NEXT_PUBLIC_SUPABASE_URL) ok("NEXT_PUBLIC_SUPABASE_URL");
else fail("NEXT_PUBLIC_SUPABASE_URL");

if (env.SUPABASE_DB_PASSWORD) ok("SUPABASE_DB_PASSWORD (migration)");
else fail("SUPABASE_DB_PASSWORD", "optionnel si migration déjà faite");

if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const { error } = await admin
    .from("profiles")
    .select("stripe_account_id")
    .limit(1);
  if (!error) ok("Migration DB Stripe (colonnes profiles)");
  else fail("Migration DB Stripe", error.message);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(failed === 0 ? "\n🎉 Prêt pour les tests locaux." : `\n⚠️  ${failed} point(s) à corriger.`);
process.exit(failed === 0 ? 0 : 1);

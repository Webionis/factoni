#!/usr/bin/env node
/**
 * Teste handleInvoicePaidSideEffects sur une facture déjà payée.
 * Usage: node scripts/test-handle-invoice-paid-side-effects.mjs [invoiceId]
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const invoiceId =
  process.argv[2] ?? "bbfb18fb-347e-40f6-a34a-35544c5e111b";

const { handleInvoicePaidSideEffects } = await import(
  pathToFileURL(
    path.join(root, "lib/invoices/handle-invoice-paid-side-effects.ts"),
  ).href
);

console.log("→ Test handleInvoicePaidSideEffects", invoiceId);

const result = await handleInvoicePaidSideEffects(invoiceId, {
  source: "test_script",
  transitioned: false,
});

console.log("→ Résultat:", result);

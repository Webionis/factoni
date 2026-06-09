#!/usr/bin/env node
/**
 * Vérifie la séparation devis (DV-) / factures (FF-) en base.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  process.exit(1);
}

const sb = createClient(url, key);

const { data: quotes, error: quotesError } = await sb
  .from("invoices")
  .select("id, invoice_number, document_type")
  .eq("document_type", "quote");

if (quotesError) {
  console.error("❌", quotesError.message);
  process.exit(1);
}

const { data: invoices, error: invoicesError } = await sb
  .from("invoices")
  .select("id, invoice_number, document_type")
  .eq("document_type", "invoice");

if (invoicesError) {
  console.error("❌", invoicesError.message);
  process.exit(1);
}

let failed = false;

for (const row of quotes ?? []) {
  if (row.document_type !== "quote") {
    console.error(`❌ Devis ${row.id} : document_type=${row.document_type}`);
    failed = true;
  }
  if (row.invoice_number?.startsWith("FF-")) {
    console.error(
      `❌ Devis ${row.id} : numéro facture ${row.invoice_number} (migration requise)`,
    );
    failed = true;
  }
}

for (const row of invoices ?? []) {
  if (row.document_type !== "invoice") {
    console.error(`❌ Facture ${row.id} : document_type=${row.document_type}`);
    failed = true;
  }
  if (row.invoice_number?.startsWith("DV-")) {
    console.error(
      `❌ Facture ${row.id} : numéro devis ${row.invoice_number}`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `✅ ${quotes?.length ?? 0} devis (DV-) et ${invoices?.length ?? 0} factures (FF-) OK`,
);

#!/usr/bin/env node
/**
 * Crée les notifications invoice_paid manquantes pour les factures déjà payées.
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

function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function displayNumber(invoiceNumber, id) {
  if (invoiceNumber?.trim()) return invoiceNumber.trim();
  return `Brouillon-${id.slice(0, 8)}`;
}

function clientNameFromSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return "Client";
  }
  const name = snapshot.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  const company = snapshot.company_name;
  if (typeof company === "string" && company.trim()) return company.trim();
  return "Client";
}

const env = { ...loadEnvFile(envPath), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Variables Supabase manquantes");
  process.exit(1);
}

const sb = createClient(url, key);

const { data: paidInvoices, error: paidError } = await sb
  .from("invoices")
  .select("id, user_id, invoice_number, total_ttc, paid_at, client_snapshot")
  .eq("document_type", "invoice")
  .eq("status", "paid")
  .order("paid_at", { ascending: false });

if (paidError) {
  console.error("❌", paidError.message);
  process.exit(1);
}

const { data: existingNotifications, error: notifError } = await sb
  .from("notifications")
  .select("data")
  .eq("type", "invoice_paid");

if (notifError) {
  console.error("❌", notifError.message);
  process.exit(1);
}

const existingInvoiceIds = new Set(
  (existingNotifications ?? [])
    .map((row) => row.data?.invoice_id)
    .filter((value) => typeof value === "string"),
);

let created = 0;
let skipped = 0;

for (const invoice of paidInvoices ?? []) {
  if (existingInvoiceIds.has(invoice.id)) {
    skipped++;
    continue;
  }

  const paidAt = invoice.paid_at ?? new Date().toISOString();
  const invoiceNumber = displayNumber(invoice.invoice_number, invoice.id);
  const clientName = clientNameFromSnapshot(invoice.client_snapshot);
  const amountTtc = Number(invoice.total_ttc);
  const amountLabel = `${formatCurrency(amountTtc)} TTC`;
  const message = `Le client ${clientName} a payé la facture ${invoiceNumber} (${amountLabel})`;

  const { error } = await sb.from("notifications").insert({
    user_id: invoice.user_id,
    type: "invoice_paid",
    title: "Facture payée 🎉",
    message,
    data: {
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
      client_name: clientName,
      amount_ttc: amountTtc,
      paid_at: paidAt,
      owner_user_id: invoice.user_id,
    },
    created_at: paidAt,
  });

  if (error) {
    if (error.code === "23505") {
      skipped++;
      continue;
    }
    console.error(`❌ ${invoice.id}:`, error.message);
    process.exit(1);
  }

  existingInvoiceIds.add(invoice.id);
  created++;
}

console.log(
  `✅ Backfill terminé : ${created} notification(s) créée(s), ${skipped} déjà présente(s).`,
);

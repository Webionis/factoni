#!/usr/bin/env node
/**
 * Compare factures payées récentes vs notifications invoice_paid et events Stripe.
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
  console.error("❌ Variables Supabase manquantes");
  process.exit(1);
}

const sb = createClient(url, key);

const { data: invoices, error: invErr } = await sb
  .from("invoices")
  .select("id, invoice_number, status, paid_at, user_id, stripe_checkout_session_id")
  .eq("document_type", "invoice")
  .eq("status", "paid")
  .order("paid_at", { ascending: false })
  .limit(10);

if (invErr) {
  console.error("❌ invoices:", invErr.message);
  process.exit(1);
}

const { data: notifications, error: notifErr } = await sb
  .from("notifications")
  .select("id, type, created_at, data, user_id")
  .eq("type", "invoice_paid")
  .order("created_at", { ascending: false })
  .limit(20);

if (notifErr) {
  console.error("❌ notifications:", notifErr.message);
  process.exit(1);
}

const { data: stripeEvents, error: evErr } = await sb
  .from("stripe_webhook_events")
  .select("stripe_event_id, event_type, processed_at")
  .order("processed_at", { ascending: false })
  .limit(15);

if (evErr) {
  console.error("❌ stripe_webhook_events:", evErr.message);
  process.exit(1);
}

const notifByInvoice = new Map();
for (const n of notifications ?? []) {
  const invoiceId = n.data?.invoice_id;
  if (invoiceId) notifByInvoice.set(invoiceId, n);
}

console.log("\n=== 10 dernières factures payées ===\n");
for (const inv of invoices ?? []) {
  const notif = notifByInvoice.get(inv.id);
  const paidAt = inv.paid_at ? new Date(inv.paid_at) : null;
  const notifAt = notif ? new Date(notif.created_at) : null;
  const delayMin =
    paidAt && notifAt
      ? Math.round((notifAt - paidAt) / 60000)
      : null;

  console.log({
    number: inv.invoice_number,
    id: inv.id.slice(0, 8),
    paid_at: inv.paid_at,
    session: inv.stripe_checkout_session_id?.slice(0, 20) ?? null,
    has_notification: Boolean(notif),
    notif_created_at: notif?.created_at ?? null,
    delay_minutes: delayMin,
    realtime: delayMin !== null && delayMin < 2 ? "✅" : delayMin !== null ? "⚠️ backfill/delay" : "❌ missing",
  });
}

console.log("\n=== 15 derniers stripe_webhook_events ===\n");
for (const ev of stripeEvents ?? []) {
  console.log({
    id: ev.stripe_event_id.slice(0, 40),
    type: ev.event_type,
    at: ev.processed_at,
  });
}

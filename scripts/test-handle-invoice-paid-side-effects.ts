import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { handleInvoicePaidSideEffects } from "../lib/invoices/handle-invoice-paid-side-effects";

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

const invoiceId = process.argv[2] ?? "bbfb18fb-347e-40f6-a34a-35544c5e111b";

async function main() {
  console.log("→ Test handleInvoicePaidSideEffects", invoiceId);
  const result = await handleInvoicePaidSideEffects(invoiceId, {
    source: "test_script",
    transitioned: false,
  });
  console.log("→ Résultat:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

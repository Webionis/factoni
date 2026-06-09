#!/usr/bin/env node
/**
 * Applique les migrations de correction numérotation devis (FF → DV).
 * Requiert SUPABASE_DB_PASSWORD dans .env.local
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

const MIGRATIONS = [
  "20250616100000_fix_document_type_quotes.sql",
  "20250617100000_renumber_mislabeled_quotes.sql",
];

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
const projectRef = "fduqyjadzkslykszpxgj";
const password = env.SUPABASE_DB_PASSWORD?.trim();

if (!password) {
  console.error(
    "❌ SUPABASE_DB_PASSWORD manquant dans .env.local\n" +
      "   Dashboard Supabase → Project Settings → Database → Database password",
  );
  process.exit(1);
}

const connectionString =
  env.SUPABASE_DB_URL?.trim() ||
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("→ Connexion Postgres OK\n");

  for (const file of MIGRATIONS) {
    const migrationPath = path.join(root, "supabase/migrations", file);
    const sql = fs.readFileSync(migrationPath, "utf8");
    console.log(`→ Application ${file}…`);
    try {
      await client.query(sql);
      console.log(`✅ ${file}`);
    } catch (error) {
      if (error.code === "42701" || error.code === "42P07") {
        console.log(`✅ ${file} (déjà appliquée)`);
        continue;
      }
      throw error;
    }
  }

  const { rows } = await client.query(`
    SELECT invoice_number, document_type, status
    FROM public.invoices
    WHERE document_type = 'quote' AND invoice_number LIKE 'FF-%'
  `);
  if (rows.length === 0) {
    console.log("\n✅ Aucun devis avec préfixe FF- restant.");
  } else {
    console.error("\n❌ Devis FF- restants :", rows);
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Échec migration :", error.message);
  process.exit(1);
} finally {
  await client.end();
}

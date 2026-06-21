#!/usr/bin/env node
/**
 * Applique toutes les migrations SQL du dépôt sur Supabase production.
 * Utilise une table de suivi _factoni_schema_migrations (idempotent).
 *
 * Prérequis : SUPABASE_DB_PASSWORD ou SUPABASE_DB_URL dans .env.local / .env.production
 *
 * Usage :
 *   npm run db:migrate:prod
 *   npm run db:migrate:prod -- --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const migrationsDir = path.join(root, "supabase", "migrations");

const EXPECTED_SCHEMA_CHECKS = [
  {
    label: "subscriptions.pending_plan",
    sql: `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'subscriptions'
        AND column_name = 'pending_plan'`,
  },
  {
    label: "subscriptions.cancel_at_period_end",
    sql: `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'subscriptions'
        AND column_name = 'cancel_at_period_end'`,
  },
  {
    label: "clients.portal_token",
    sql: `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'clients'
        AND column_name = 'portal_token'`,
  },
  {
    label: "invoices.stripe_checkout_session_id",
    sql: `SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'invoices'
        AND column_name = 'stripe_checkout_session_id'`,
  },
];

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

function resolveEnv(argv) {
  const envFileArgIndex = argv.indexOf("--env-file");
  const explicit = envFileArgIndex !== -1 ? argv[envFileArgIndex + 1] : null;
  const candidates = explicit
    ? [path.resolve(root, explicit)]
    : [path.join(root, ".env.production"), path.join(root, ".env.local")];

  let loadedFrom = null;
  let fileEnv = {};
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      Object.assign(fileEnv, loadEnvFile(candidate));
      loadedFrom = loadedFrom ?? path.basename(candidate);
    }
  }
  return { env: { ...fileEnv, ...process.env }, loadedFrom };
}

/** Connexion Postgres Supabase — directe par défaut (fiable pour les migrations). */
function buildConnectionString(env, projectRef) {
  const explicit = env.SUPABASE_DB_URL?.trim();
  if (explicit) return explicit;

  const password = env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const poolerHost = env.SUPABASE_DB_POOLER_HOST?.trim();
  if (poolerHost) {
    return `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${poolerHost}:6543/postgres`;
  }

  // Direct — Dashboard → Connect → URI (port 5432)
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._factoni_schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function isApplied(client, filename) {
  const { rows } = await client.query(
    `SELECT 1 FROM public._factoni_schema_migrations WHERE filename = $1`,
    [filename],
  );
  return rows.length > 0;
}

async function markApplied(client, filename) {
  await client.query(
    `INSERT INTO public._factoni_schema_migrations (filename) VALUES ($1)
     ON CONFLICT (filename) DO NOTHING`,
    [filename],
  );
}

function isBenignMigrationError(error) {
  const code = error.code;
  const message = String(error.message ?? "");
  return (
    code === "42701" || // duplicate column
    code === "42P07" || // duplicate table
    code === "42710" || // duplicate object
    message.includes("already exists")
  );
}

async function verifySchema(client) {
  console.log("\n── Vérification schéma production ──");
  let ok = 0;
  let failed = 0;

  for (const check of EXPECTED_SCHEMA_CHECKS) {
    const { rows } = await client.query(check.sql);
    if (rows.length > 0) {
      console.log(`✅ ${check.label}`);
      ok++;
    } else {
      console.log(`❌ ${check.label} — colonne absente`);
      failed++;
    }
  }

  const { rows: subDefault } = await client.query(`
    SELECT column_default FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'plan'
  `);
  const defaultPlan = subDefault[0]?.column_default ?? "";
  if (defaultPlan.includes("free")) {
    console.log("✅ subscriptions.plan DEFAULT free");
    ok++;
  } else {
    console.log(`⚠️  subscriptions.plan DEFAULT = ${defaultPlan || "(aucun)"} — attendu free`);
  }

  return failed === 0;
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const verifyOnly = argv.includes("--verify");
  const { env, loadedFrom } = resolveEnv(argv);

  const projectRef = "fduqyjadzkslykszpxgj";

  const connectionString = buildConnectionString(env, projectRef);

  if (!connectionString) {
    console.error(
      "❌ SUPABASE_DB_PASSWORD ou SUPABASE_DB_URL requis\n" +
        "   Dashboard Supabase → Connect → URI (copier dans SUPABASE_DB_URL)\n" +
        "   ou Database Settings → mot de passe → SUPABASE_DB_PASSWORD",
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error("❌ Aucune migration dans supabase/migrations");
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   Factoni — migrations Supabase production       ║");
  console.log("╚══════════════════════════════════════════════════╝");
  if (loadedFrom) console.log(`Env : ${loadedFrom}`);
  console.log(`${files.length} migration(s) dans le dépôt\n`);

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("→ Connexion Postgres OK");

    if (verifyOnly) {
      const valid = await verifySchema(client);
      process.exit(valid ? 0 : 1);
    }

    await ensureMigrationTable(client);

    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      const already = await isApplied(client, file);
      if (already) {
        skipped++;
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      if (dryRun) {
        console.log(`[dry-run] Appliquerait : ${file}`);
        continue;
      }

      console.log(`→ ${file}…`);
      try {
        await client.query(sql);
        await markApplied(client, file);
        console.log(`✅ ${file}`);
        applied++;
      } catch (error) {
        if (isBenignMigrationError(error)) {
          await markApplied(client, file);
          console.log(`✅ ${file} (déjà en place)`);
          skipped++;
          continue;
        }
        throw error;
      }
    }

    console.log(`\nRésumé : ${applied} appliquée(s), ${skipped} déjà présente(s)`);

    const valid = await verifySchema(client);
    if (!valid) {
      console.error("\n❌ Schéma incomplet — relancez après correction.");
      process.exit(1);
    }

    console.log("\n✅ Migrations production : OK\n");
  } catch (error) {
    console.error("\n❌ Échec :", error.message);
    if (String(error.message).includes("Tenant or user not found")) {
      console.error(
        "\n💡 Astuce : copiez l’URI depuis Supabase → Connect → ORM / Prisma\n" +
          "   et ajoutez-la dans .env.local :\n" +
          "   SUPABASE_DB_URL=postgresql://postgres:...@db....supabase.co:5432/postgres",
      );
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

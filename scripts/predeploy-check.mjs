#!/usr/bin/env node
/**
 * Checklist automatique avant déploiement bêta production Factoni.
 *
 * Usage :
 *   npm run build
 *   npm run predeploy:check
 *
 * Options :
 *   --build        Lance npm run build avant les vérifications
 *   --skip-build   Ignore la vérification du build (.next/BUILD_ID)
 *   --env-file     Chemin vers un fichier .env (défaut : .env.production puis .env.local)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const PRODUCTION_APP_URL = "https://factoni.fr";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_BILLING_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER_MONTHLY",
  "STRIPE_PRICE_PRO_MONTHLY",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CRON_SECRET",
];

const FORBIDDEN_IN_NEXT_PUBLIC_PATTERNS = [
  { label: "service_role", regex: /service[_-]?role/i },
  { label: "sk_live/sk_test", regex: /^sk_(live|test)_/ },
  { label: "whsec_", regex: /^whsec_/ },
  { label: "re_ (Resend)", regex: /^re_/ },
  { label: "JWT service_role payload", regex: /service_role/i },
];

const CRITICAL_ROUTES = [
  "app/d/[token]/page.tsx",
  "app/client/[token]/page.tsx",
  "app/api/cron/invoice-reminders/route.ts",
  "app/api/stripe/webhook/route.ts",
  "app/api/webhooks/stripe/route.ts",
  "app/api/public/d/[token]/pdf/route.ts",
  "app/api/public/d/[token]/sign/route.ts",
  "app/api/stripe/checkout/route.ts",
  "app/api/stripe/checkout-deposit/route.ts",
  "app/auth/callback/route.ts",
  "middleware.ts",
  "vercel.json",
];

const EXPECTED_MIGRATION_KEYWORDS = [
  "public_document_token",
  "portal_token",
  "invoice_reminders",
  "export_history",
  "export_schedules",
  "deposit_requested",
  "deposit_paid",
  "ready",
  "notifications",
  "signatures",
];

const checks = [];

function ok(label, detail = "") {
  checks.push({ label, ok: true });
  console.log(`✅ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, hint = "") {
  checks.push({ label, ok: false });
  console.log(`❌ ${label}${hint ? ` — ${hint}` : ""}`);
}

function warn(label, hint = "") {
  console.log(`⚠️  ${label}${hint ? ` — ${hint}` : ""}`);
}

function maskValue(value) {
  const trimmed = String(value).trim();
  if (!trimmed) return "(vide)";
  if (trimmed.length <= 8) return "****";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)} (masqué)`;
}

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
  const explicitEnvFile =
    envFileArgIndex !== -1 ? argv[envFileArgIndex + 1] : null;

  const candidates = explicitEnvFile
    ? [path.resolve(root, explicitEnvFile)]
    : [
        path.join(root, ".env.production"),
        path.join(root, ".env.local"),
      ];

  let loadedFrom = null;
  let fileEnv = {};

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      fileEnv = loadEnvFile(candidate);
      loadedFrom = path.basename(candidate);
      break;
    }
  }

  return {
    env: { ...fileEnv, ...process.env },
    loadedFrom,
  };
}

function checkEnvVars(env, loadedFrom) {
  console.log("\n── Variables d'environnement ──");
  if (loadedFrom) {
    ok(`Fichier env chargé`, loadedFrom);
  } else if (Object.keys(process.env).some((k) => REQUIRED_ENV.includes(k))) {
    ok("Variables env", "process.env (CI / Vercel)");
  } else {
    fail(
      "Fichier env",
      "Créez .env.production depuis .env.production.example ou utilisez --env-file",
    );
  }

  for (const key of REQUIRED_ENV) {
    const value = env[key]?.trim();
    if (!value) {
      fail(`Variable obligatoire : ${key}`);
      continue;
    }
    ok(`Variable présente : ${key}`, maskValue(value));
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl === PRODUCTION_APP_URL) {
    ok(`NEXT_PUBLIC_APP_URL`, PRODUCTION_APP_URL);
  } else {
    fail(
      `NEXT_PUBLIC_APP_URL`,
      `Attendu ${PRODUCTION_APP_URL}, reçu ${appUrl ?? "(vide)"}`,
    );
  }

  const cronSecret = env.CRON_SECRET?.trim();
  if (cronSecret && cronSecret.length >= 16) {
    ok("CRON_SECRET longueur", `≥ 16 caractères (${maskValue(cronSecret)})`);
  } else if (cronSecret) {
    fail("CRON_SECRET", "Minimum 16 caractères recommandé");
  }

  const emailFrom = env.EMAIL_FROM?.trim();
  if (emailFrom?.includes("factoni.fr")) {
    ok("EMAIL_FROM domaine", emailFrom);
  } else if (emailFrom) {
    warn("EMAIL_FROM", `Attendu *@factoni.fr, reçu ${emailFrom}`);
  }

  const stripeMode = env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
    ? "LIVE"
    : env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
      ? "TEST"
      : "INCONNU";
  if (stripeMode === "TEST") {
    ok("Stripe mode", "TEST (recommandé bêta)");
  } else if (stripeMode === "LIVE") {
    warn("Stripe mode", "LIVE — confirmer avant bêta privée");
  } else {
    fail("Stripe mode", "Clé STRIPE_SECRET_KEY invalide (sk_test_ ou sk_live_)");
  }
}

function checkSecretExposure(env) {
  console.log("\n── Sécurité (NEXT_PUBLIC_*) ──");

  const publicKeys = Object.keys(env).filter((k) => k.startsWith("NEXT_PUBLIC_"));
  let exposed = false;

  for (const key of publicKeys) {
    if (/SERVICE.?ROLE|SECRET|WEBHOOK|RESEND|CRON/i.test(key)) {
      fail(`Nom de variable suspect : ${key}`, "Ne jamais exposer de secret en NEXT_PUBLIC_");
      exposed = true;
    }

    const value = env[key]?.trim() ?? "";
    for (const { label, regex } of FORBIDDEN_IN_NEXT_PUBLIC_PATTERNS) {
      if (regex.test(value)) {
        fail(`Secret exposé dans ${key}`, `Pattern détecté : ${label}`);
        exposed = true;
      }
    }
  }

  if (!exposed) {
    ok("Aucune clé secrète exposée en NEXT_PUBLIC_*");
  }
}

function checkBuild(argv) {
  console.log("\n── Build production ──");
  const buildIdPath = path.join(root, ".next", "BUILD_ID");
  const shouldRunBuild = argv.includes("--build");
  const skipBuild = argv.includes("--skip-build");

  if (shouldRunBuild) {
    console.log("   Lancement de npm run build…");
    const result = spawnSync("npm", ["run", "build"], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    if (result.status === 0) {
      ok("npm run build");
    } else {
      fail("npm run build", `Code de sortie ${result.status}`);
    }
    return;
  }

  if (skipBuild) {
    warn("Build", "Vérification ignorée (--skip-build)");
    return;
  }

  if (fs.existsSync(buildIdPath)) {
    const buildId = fs.readFileSync(buildIdPath, "utf8").trim();
    ok("Build détecté", `.next/BUILD_ID = ${buildId}`);
  } else {
    fail(
      "Build absent",
      "Exécutez npm run build ou npm run predeploy:check -- --build",
    );
  }
}

function checkCriticalRoutes() {
  console.log("\n── Routes critiques ──");
  let missing = 0;

  for (const relativePath of CRITICAL_ROUTES) {
    const fullPath = path.join(root, relativePath);
    if (fs.existsSync(fullPath)) {
      ok(`Route : ${relativePath}`);
    } else {
      fail(`Route manquante : ${relativePath}`);
      missing++;
    }
  }

  if (missing === 0) {
    ok("Toutes les routes critiques sont présentes");
  }
}

function checkMigrations() {
  console.log("\n── Migrations Supabase ──");
  const migrationsDir = path.join(root, "supabase", "migrations");

  if (!fs.existsSync(migrationsDir)) {
    fail("Dossier supabase/migrations introuvable");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    fail("Aucune migration .sql détectée");
    return;
  }

  ok("Migrations détectées", `${files.length} fichier(s)`);

  const combined = files
    .map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf8"))
    .join("\n");

  for (const keyword of EXPECTED_MIGRATION_KEYWORDS) {
    if (combined.includes(keyword)) {
      ok(`Migration : ${keyword}`);
    } else {
      fail(`Mot-clé migration absent : ${keyword}`);
    }
  }
}

function checkVercelCron() {
  console.log("\n── Vercel cron ──");
  const vercelPath = path.join(root, "vercel.json");

  if (!fs.existsSync(vercelPath)) {
    fail("vercel.json introuvable");
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
    const crons = config.crons ?? [];
    const reminderCron = crons.find(
      (c) => c.path === "/api/cron/invoice-reminders",
    );

    if (reminderCron) {
      ok("Cron invoice-reminders", `schedule = ${reminderCron.schedule}`);
    } else {
      fail(
        "Cron invoice-reminders",
        'Ajoutez { "path": "/api/cron/invoice-reminders", "schedule": "0 9 * * *" }',
      );
    }

    if (config.regions?.includes("cdg1")) {
      ok("Région Vercel", "cdg1 (Paris)");
    } else {
      warn("Région Vercel", 'Recommandé : "regions": ["cdg1"]');
    }
  } catch (error) {
    fail("vercel.json invalide", error.message);
  }
}

function checkStripeBilling(env) {
  console.log("\n── Stripe Billing (abonnement SaaS) ──");

  const billingEnabled = env.STRIPE_BILLING_ENABLED?.trim();
  if (billingEnabled === "false") {
    warn(
      "STRIPE_BILLING_ENABLED",
      "false — billing désactivé explicitement (auto si price IDs présents)",
    );
  } else {
    ok("Stripe Billing", billingEnabled === "true" ? "activé" : "auto si price IDs");
  }

  const starterPrice = env.STRIPE_PRICE_STARTER_MONTHLY?.trim();
  const proPrice = env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  if (starterPrice?.startsWith("price_")) {
    ok("STRIPE_PRICE_STARTER_MONTHLY", maskValue(starterPrice));
  } else {
    fail("STRIPE_PRICE_STARTER_MONTHLY", "Format price_… requis");
  }

  if (proPrice?.startsWith("price_")) {
    ok("STRIPE_PRICE_PRO_MONTHLY", maskValue(proPrice));
  } else {
    fail("STRIPE_PRICE_PRO_MONTHLY", "Format price_… requis");
  }

  const billingWebhook = env.STRIPE_BILLING_WEBHOOK_SECRET?.trim();
  if (billingWebhook?.startsWith("whsec_")) {
    ok("STRIPE_BILLING_WEBHOOK_SECRET", maskValue(billingWebhook));
  } else {
    fail(
      "STRIPE_BILLING_WEBHOOK_SECRET",
      "Webhook /api/webhooks/stripe — format whsec_…",
    );
  }

  ok("Endpoint billing", `${PRODUCTION_APP_URL}/api/webhooks/stripe`);
}

function checkLaunchMode(env) {
  console.log("\n── Mode lancement ──");
  const launch = env.FACTONI_PRODUCTION_LAUNCH?.trim();
  if (launch === "true") {
    ok("FACTONI_PRODUCTION_LAUNCH", "forcé actif");
  } else if (launch === "false") {
    warn("FACTONI_PRODUCTION_LAUNCH", "désactivé — gating Starter/Pro inactif");
  } else {
    ok(
      "FACTONI_PRODUCTION_LAUNCH",
      "auto en production si billing Stripe configuré",
    );
  }
}

function checkStripeWebhookRoute() {
  console.log("\n── Stripe Connect webhook ──");
  const webhookRoute = path.join(root, "app/api/stripe/webhook/route.ts");

  if (!fs.existsSync(webhookRoute)) {
    fail("Route /api/stripe/webhook absente");
    return;
  }

  const source = fs.readFileSync(webhookRoute, "utf8");
  if (source.includes("checkout.session.completed")) {
    ok("Webhook Stripe", "checkout.session.completed géré");
  } else {
    fail("Webhook Stripe", "Handler checkout.session.completed introuvable");
  }

  ok("Endpoint production", `${PRODUCTION_APP_URL}/api/stripe/webhook`);
}

function checkResendVars(env) {
  console.log("\n── Resend ──");
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();

  if (apiKey?.startsWith("re_")) {
    ok("RESEND_API_KEY", maskValue(apiKey));
  } else {
    fail("RESEND_API_KEY", "Format attendu : re_…");
  }

  if (from) {
    ok("EMAIL_FROM", from);
  } else {
    fail("EMAIL_FROM", 'Exemple : Factoni <contact@factoni.fr>');
  }
}

function main() {
  const argv = process.argv.slice(2);
  const { env, loadedFrom } = resolveEnv(argv);

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   Factoni — vérification pré-déploiement bêta   ║");
  console.log("╚══════════════════════════════════════════════════╝");

  checkEnvVars(env, loadedFrom);
  checkSecretExposure(env);
  checkResendVars(env);
  checkBuild(argv);
  checkCriticalRoutes();
  checkMigrations();
  checkVercelCron();
  checkStripeBilling(env);
  checkLaunchMode(env);
  checkStripeWebhookRoute();

  const passed = checks.filter((c) => c.ok).length;
  const failed = checks.filter((c) => !c.ok).length;

  console.log("\n── Résumé ──");
  console.log(`   ${passed} vérification(s) OK`);
  if (failed > 0) {
    console.log(`   ${failed} vérification(s) en échec`);
    console.log("\n❌ Pré-déploiement : ÉCHEC — corrigez les points ci-dessus.\n");
    process.exit(1);
  }

  console.log("\n✅ Pré-déploiement : OK — prêt pour Vercel Production.\n");
  console.log("Prochaines étapes manuelles :");
  console.log("  1. npm run db:migrate:prod  (ou npx supabase db push)");
  console.log("  2. Supabase Auth → Site URL + Redirect URLs");
  console.log(
    "  3. Stripe → webhooks https://factoni.fr/api/stripe/webhook ET /api/webhooks/stripe",
  );
  console.log("  4. Variables Vercel Production (voir .env.production.example)");
  console.log("  5. Deploy + test checkout Starter/Pro sur /settings/billing\n");
}

main();

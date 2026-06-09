/**
 * Variables publiques (préfixe NEXT_PUBLIC_) — sûres côté client, protégées par RLS.
 * Ne jamais ajouter SUPABASE_SERVICE_ROLE_KEY ici.
 */

const publicEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

export type PublicEnvKey = (typeof publicEnvKeys)[number];

export function getPublicEnv(key: PublicEnvKey): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${key}. Voir .env.local.example`,
    );
  }
  return value;
}

/** Valide les variables requises (build / démarrage serveur). */
export function assertPublicEnvConfigured(): void {
  for (const key of publicEnvKeys) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Configuration incomplète : ${key} est requis.`);
    }
  }
}

export function getOptionalSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

/** Clé API Resend — serveur uniquement, jamais exposée au client. */
export function getOptionalResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || undefined;
}

/** Adresse expéditeur vérifiée chez Resend — serveur uniquement. */
export function getOptionalEmailFrom(): string | undefined {
  const from = process.env.EMAIL_FROM?.trim();
  return from || undefined;
}

export interface EmailEnvConfig {
  apiKey: string;
  from: string;
}

export function getEmailEnvConfig(): EmailEnvConfig | null {
  const apiKey = getOptionalResendApiKey();
  const from = getOptionalEmailFrom();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export function isEmailConfigured(): boolean {
  return getEmailEnvConfig() !== null;
}

export const EMAIL_NOT_CONFIGURED_MESSAGE =
  "L'envoi d'emails n'est pas configuré. Ajoutez RESEND_API_KEY et EMAIL_FROM à votre environnement.";

/** Code d'erreur renvoyé aux formulaires quand la session JWT est invalide. */
export const SESSION_EXPIRED_CODE = "SESSION_EXPIRED" as const;

const SUPABASE_MESSAGE_MAP: Record<string, string> = {
  "JWT expired": SESSION_EXPIRED_CODE,
  "Invalid JWT": SESSION_EXPIRED_CODE,
  "Auth session missing": SESSION_EXPIRED_CODE,
  "new row violates row-level security policy":
    "Action non autorisée.",
  "duplicate key value violates unique constraint":
    "Cette ressource existe déjà.",
};

export function isAuthSessionError(message?: string | null): boolean {
  if (!message) return false;
  return (
    message.includes("JWT") ||
    message.includes("session") ||
    message.includes("Auth")
  );
}

/** Transforme les messages Supabase / PostgREST en messages utilisateur. */
export function formatSupabaseError(
  error: { message?: string; code?: string } | null | undefined,
  fallback = "Une erreur est survenue. Réessayez.",
): string {
  if (!error?.message) return fallback;

  for (const [pattern, mapped] of Object.entries(SUPABASE_MESSAGE_MAP)) {
    if (error.message.includes(pattern)) return mapped;
  }

  if (error.message.length > 120) {
    return fallback;
  }

  return error.message;
}

export function authRequiredError(sessionExpired = false): string {
  return sessionExpired
    ? SESSION_EXPIRED_CODE
    : "Vous devez être connecté.";
}

export const NETWORK_ERROR_MESSAGE =
  "Connexion impossible. Vérifiez votre réseau et réessayez.";

export type ActionResult = {
  error?: string;
  success?: boolean;
};

export function actionErrorFromSupabase(
  error: { message?: string } | null | undefined,
  fallback = "Une erreur est survenue. Réessayez.",
): ActionResult {
  return { error: formatSupabaseError(error, fallback) };
}

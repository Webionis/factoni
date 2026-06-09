import { captureException } from "@/lib/monitoring/sentry";

/** Journalisation serveur — détail en dev, Sentry en prod si configuré. */
export function logServerError(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${scope}]`, error, context);
  } else {
    captureException(error, { scope, ...context });
  }
}

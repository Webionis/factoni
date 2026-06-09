/**
 * Monitoring optionnel — activer avec NEXT_PUBLIC_SENTRY_DSN sur Vercel.
 * Installer @sentry/nextjs et brancher captureException dans instrumentation.ts si besoin.
 */

export function isSentryEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!isSentryEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.error("[monitoring]", error, context);
    }
    return;
  }
  // Branchement Sentry : import * as Sentry from '@sentry/nextjs'; Sentry.captureException(error);
  console.error("[sentry-stub]", error, context);
}

export function captureMessage(message: string) {
  if (!isSentryEnabled()) return;
  // Branchement Sentry : Sentry.captureMessage(message);
}

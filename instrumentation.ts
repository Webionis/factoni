export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { isSentryEnabled } = await import("@/lib/monitoring/sentry");
    if (isSentryEnabled()) {
      // Point d'entrée pour @sentry/nextjs : Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN })
    }
  }
}

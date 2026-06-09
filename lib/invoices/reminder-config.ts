/** Passe à true quand le cron Vercel est branché. */
export const INVOICE_REMINDER_CRON_ENABLED = true;

export function getCronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null;
}

export function isValidCronRequest(authorizationHeader: string | null): boolean {
  const secret = getCronSecret();
  if (!secret) return false;
  if (!authorizationHeader?.startsWith("Bearer ")) return false;
  return authorizationHeader.slice(7).trim() === secret;
}

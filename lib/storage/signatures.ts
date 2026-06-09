export const SIGNATURES_BUCKET = "signatures";

export function buildSignatureStoragePath(
  quoteId: string,
  timestamp = Date.now(),
): string {
  return `${quoteId}/${timestamp}.png`;
}

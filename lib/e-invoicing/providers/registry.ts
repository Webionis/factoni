import type { EinvoicingProvider } from "@/lib/e-invoicing/types";

const providers = new Map<string, EinvoicingProvider>();

export function registerEinvoicingProvider(provider: EinvoicingProvider): void {
  providers.set(provider.slug, provider);
}

export function getEinvoicingProvider(
  slug: string | null | undefined,
): EinvoicingProvider | null {
  if (!slug?.trim()) {
    return null;
  }
  return providers.get(slug.trim()) ?? null;
}

export function listEinvoicingProviders(): EinvoicingProvider[] {
  return [...providers.values()];
}

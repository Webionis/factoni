import {
  getPlatformEinvoicingConfig,
  isPlatformEinvoicingActive,
} from "@/lib/e-invoicing/config";
import type { CompanyEinvoicingSettings } from "@/lib/data/einvoicing";

export function resolveEinvoicingProviderSlug(
  companySettings: CompanyEinvoicingSettings | null,
): string | null {
  if (isPlatformEinvoicingActive()) {
    return getPlatformEinvoicingConfig().providerSlug;
  }

  if (companySettings?.enabled && companySettings.provider_slug?.trim()) {
    return companySettings.provider_slug.trim();
  }

  return null;
}

export function isEinvoicingTransmissionConfigured(
  companySettings: CompanyEinvoicingSettings | null,
): boolean {
  return resolveEinvoicingProviderSlug(companySettings) !== null;
}

export type PlatformEinvoicingProviderSlug = "iopole" | "factoni-dev";

export interface PlatformEinvoicingConfig {
  enabled: boolean;
  autoTransmitOnSend: boolean;
  providerSlug: PlatformEinvoicingProviderSlug;
  apiKey: string | null;
  apiBaseUrl: string;
  useDevProvider: boolean;
}

const DEFAULT_API_BASE_URL = "https://api.iopole.com";

export function getPlatformEinvoicingConfig(): PlatformEinvoicingConfig {
  const enabled = process.env.EINVOICING_ENABLED === "true";
  const apiKey = process.env.EINVOICING_API_KEY?.trim() || null;
  const useDevProvider =
    process.env.EINVOICING_USE_DEV_PROVIDER === "true" ||
    (process.env.NODE_ENV === "development" && !apiKey);

  const providerSlug: PlatformEinvoicingProviderSlug =
    useDevProvider && enabled ? "factoni-dev" : "iopole";

  return {
    enabled,
    autoTransmitOnSend: process.env.EINVOICING_AUTO_TRANSMIT !== "false",
    providerSlug,
    apiKey,
    apiBaseUrl: process.env.EINVOICING_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    useDevProvider,
  };
}

export function isPlatformEinvoicingActive(): boolean {
  const config = getPlatformEinvoicingConfig();
  if (!config.enabled) {
    return false;
  }
  return Boolean(config.apiKey) || config.useDevProvider;
}

import type { EinvoicingProvider } from "@/lib/e-invoicing/types";

/** Simulation locale — remplacée par Iopole en production. */
export const factoniDevEinvoicingProvider: EinvoicingProvider = {
  slug: "factoni-dev",
  label: "Factoni (simulation PA)",
  async submit() {
    return {
      externalId: `dev-${crypto.randomUUID()}`,
      status: "accepted",
    };
  },
};

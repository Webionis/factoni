import { factoniDevEinvoicingProvider } from "@/lib/e-invoicing/providers/factoni-dev";
import { iopoleEinvoicingProvider } from "@/lib/e-invoicing/providers/iopole";
import { registerEinvoicingProvider } from "@/lib/e-invoicing/providers/registry";

let registered = false;

export function ensureEinvoicingProvidersRegistered(): void {
  if (registered) {
    return;
  }

  registerEinvoicingProvider(iopoleEinvoicingProvider);
  registerEinvoicingProvider(factoniDevEinvoicingProvider);
  registered = true;
}

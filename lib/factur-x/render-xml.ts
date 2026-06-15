import {
  buildXml,
  Flavor,
  Profile,
  validateInput,
} from "@stackforge-eu/factur-x";

import { mapInvoicePdfDataToFacturXInput } from "@/lib/factur-x/map-invoice-input";
import type { InvoicePdfData } from "@/lib/pdf/types";

export function renderInvoiceFacturXXml(data: InvoicePdfData): string {
  const input = mapInvoicePdfDataToFacturXInput(data);
  const validation = validateInput(input, Profile.EN16931, Flavor.FACTUR_X);

  if (!validation.valid) {
    const details = validation.errors.map((error) => error.message).join("; ");
    throw new Error(
      details
        ? `Données Factur-X invalides : ${details}`
        : "Données Factur-X invalides",
    );
  }

  return buildXml(input, Profile.EN16931, Flavor.FACTUR_X);
}

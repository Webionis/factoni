import {
  embedFacturX,
  Flavor,
  Profile,
  validateInput,
} from "@stackforge-eu/factur-x";

import { mapInvoicePdfDataToFacturXInput } from "@/lib/factur-x/map-invoice-input";
import type { InvoicePdfData } from "@/lib/pdf/types";

export async function renderInvoiceFacturX(
  pdfBuffer: Buffer,
  data: InvoicePdfData,
): Promise<Buffer> {
  const input = mapInvoicePdfDataToFacturXInput(data);
  const validation = validateInput(input, Profile.EN16931, Flavor.FACTUR_X);

  if (!validation.valid) {
    const details = validation.errors
      .map((error) => error.message)
      .join("; ");
    throw new Error(
      details
        ? `Données Factur-X invalides : ${details}`
        : "Données Factur-X invalides",
    );
  }

  const result = await embedFacturX({
    pdf: pdfBuffer,
    input,
    profile: Profile.EN16931,
    flavor: Flavor.FACTUR_X,
  });

  return Buffer.from(result.pdf);
}

import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf-document";
import type { InvoicePdfData } from "@/lib/pdf/types";

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoicePdfDocument data={data} />);
  return Buffer.from(buffer);
}

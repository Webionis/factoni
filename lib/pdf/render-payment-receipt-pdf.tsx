import { renderToBuffer } from "@react-pdf/renderer";

import { PaymentReceiptPdfDocument } from "@/lib/pdf/payment-receipt-pdf-document";
import type { PaymentReceiptPdfData } from "@/lib/pdf/receipt-types";

export async function renderPaymentReceiptPdf(
  data: PaymentReceiptPdfData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <PaymentReceiptPdfDocument data={data} />,
  );
  return Buffer.from(buffer);
}

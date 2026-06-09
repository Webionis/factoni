import { renderToBuffer } from "@react-pdf/renderer";

import { DepositReceiptPdfDocument } from "@/lib/pdf/deposit-receipt-pdf-document";
import type { DepositReceiptPdfData } from "@/lib/pdf/deposit-receipt-types";

export async function renderDepositReceiptPdf(
  data: DepositReceiptPdfData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <DepositReceiptPdfDocument data={data} />,
  );
  return Buffer.from(buffer);
}

import type { PdfParty } from "@/lib/pdf/types";

export interface DepositReceiptPdfData {
  filename: string;
  quoteNumber: string;
  paidAt: string;
  depositAmount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  client: PdfParty;
  emitter: PdfParty;
  generatedAt: string;
}

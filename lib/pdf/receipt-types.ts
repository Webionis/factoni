import type { PdfParty } from "@/lib/pdf/types";

export interface PaymentReceiptPdfData {
  filename: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalTtc: number;
  paidAt: string;
  paymentMethod: string;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  client: PdfParty;
  emitter: PdfParty;
  generatedAt: string;
}

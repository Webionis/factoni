import type { DocumentType } from "@/lib/documents/types";
import type { InvoiceStatus } from "@/lib/invoices/status";
import type { QuoteStatus } from "@/lib/quotes/status";
import type { VatRegime } from "@/lib/constants/vat";

export interface PdfParty {
  name: string;
  subtitle?: string | null;
  addressLines: string[];
  email?: string | null;
  phone?: string | null;
  siren?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
}

export interface PdfInvoiceLine {
  description: string;
  quantity: number;
  unitPriceHt: number;
  vatRate: number;
  lineTotalHt: number;
  lineVat: number;
  lineTotalTtc: number;
}

export interface PdfVatBreakdownRow {
  rate: number;
  baseHt: number;
  vatAmount: number;
}

export interface InvoicePdfData {
  filename: string;
  documentKind: DocumentType;
  documentTitle: string;
  invoiceNumber: string | null;
  status: InvoiceStatus | QuoteStatus;
  issueDate: string;
  dueDate: string;
  paymentTerms: string | null;
  notes: string | null;
  emitter: PdfParty;
  client: PdfParty;
  lines: PdfInvoiceLine[];
  /** Montants stockés sur la facture — jamais recalculés */
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  /** Somme des line_total_ht stockées (affichage remise) */
  linesSubtotalHt: number;
  linesSubtotalVat: number;
  discountPercent: number | null;
  discountAmount: number | null;
  vatRegime: VatRegime;
  legalMentions: string | null;
  vatBreakdown: PdfVatBreakdownRow[];
  logoUrl: string | null;
  isDraft: boolean;
  isCancelled: boolean;
  dataSource: "snapshots" | "draft_fallback";
  acceptance?: {
    acceptedByName: string;
    acceptedAt: string;
    signatureUrl: string | null;
  };
  deposit?: {
    typeLabel: string;
    depositAmount: number;
    remainingBalance: number;
    status: "requested" | "paid";
    paidAt?: string | null;
  };
}

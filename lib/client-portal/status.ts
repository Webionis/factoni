import { buildPublicDocumentUrl } from "@/lib/documents/public-token";
import { getEffectiveInvoiceStatus } from "@/lib/invoices/overdue";
import { normalizeInvoiceStatus } from "@/lib/invoices/status";
import { getEffectiveQuoteStatus } from "@/lib/quotes/expiry";
import {
  canPayQuoteDeposit,
  normalizeQuoteDepositStatus,
} from "@/lib/quotes/deposit";
import { canAcceptQuote } from "@/lib/quotes/expiry";
import { normalizeQuoteStatus } from "@/lib/quotes/status";
import { canDownloadPaymentReceipt } from "@/lib/invoices/receipt-eligibility";
import type { Database } from "@/types/database";

export type PortalDocumentKind = "quote" | "invoice";

export type PortalDocumentRow = {
  id: string;
  document_type: Database["public"]["Enums"]["document_type"];
  status: Database["public"]["Enums"]["invoice_status"];
  invoice_number: string | null;
  issue_date: string;
  due_date: string;
  total_ttc: number;
  public_document_token: string | null;
  quote_deposit_status: Database["public"]["Enums"]["quote_deposit_status"];
  quote_deposit_amount?: number | null;
  quote_deposit_paid_at?: string | null;
  paid_at: string | null;
  converted_to_invoice_id: string | null;
};

export type PortalClientStatus =
  | "to_sign"
  | "accepted"
  | "deposit_to_pay"
  | "deposit_paid"
  | "invoiced"
  | "rejected"
  | "expired"
  | "to_pay"
  | "overdue"
  | "paid"
  | "cancelled";

export type PortalDocumentView = {
  id: string;
  kind: PortalDocumentKind;
  number: string;
  issueDate: string;
  dueDate: string;
  totalTtc: number;
  depositAmount: number | null;
  publicToken: string;
  clientStatus: PortalClientStatus;
  clientStatusLabel: string;
  priority: number;
  actions: PortalDocumentAction[];
};

export type PortalDocumentAction =
  | "view"
  | "sign"
  | "pay_deposit"
  | "pay_invoice"
  | "download_pdf"
  | "download_receipt"
  | "download_deposit_receipt";

export type PortalReceiptView = {
  id: string;
  kind: "invoice_payment" | "deposit";
  label: string;
  date: string;
  amount: number;
  publicToken: string;
  downloadUrl: string;
};

export const PORTAL_STATUS_LABELS: Record<PortalClientStatus, string> = {
  to_sign: "À signer",
  accepted: "Accepté",
  deposit_to_pay: "Acompte demandé",
  deposit_paid: "Acompte payé",
  invoiced: "Facturé",
  rejected: "Refusé",
  expired: "Expiré",
  to_pay: "À payer",
  overdue: "En retard",
  paid: "Payée",
  cancelled: "Annulée",
};

export type PortalStatusTone = "action" | "success" | "warning" | "danger" | "muted";

export const PORTAL_STATUS_TONES: Record<PortalClientStatus, PortalStatusTone> = {
  to_sign: "action",
  to_pay: "action",
  deposit_to_pay: "warning",
  overdue: "danger",
  paid: "success",
  accepted: "success",
  deposit_paid: "success",
  invoiced: "muted",
  rejected: "muted",
  expired: "muted",
  cancelled: "muted",
};

const HIDDEN_STATUSES = new Set(["draft", "ready", "cancelled"]);

export function isPortalDocumentWithPositiveAmount(
  doc: Pick<PortalDocumentRow, "total_ttc">,
): boolean {
  return Number(doc.total_ttc) > 0;
}

export function isPortalDocumentVisible(
  doc: Pick<PortalDocumentRow, "status" | "public_document_token" | "total_ttc">,
): boolean {
  if (HIDDEN_STATUSES.has(doc.status)) return false;
  if (!isPortalDocumentWithPositiveAmount(doc)) return false;
  const token = doc.public_document_token?.trim();
  return Boolean(token && token.length >= 16);
}

function resolveQuoteClientStatus(doc: PortalDocumentRow): PortalClientStatus {
  const status = normalizeQuoteStatus(doc.status);
  const effective = getEffectiveQuoteStatus(status, doc.due_date);
  const depositStatus = normalizeQuoteDepositStatus(doc.quote_deposit_status);

  if (effective === "expired") return "expired";
  if (status === "rejected") return "rejected";
  if (status === "invoiced") return "invoiced";
  if (depositStatus === "paid" || status === "deposit_paid") return "deposit_paid";
  if (depositStatus === "requested" || status === "deposit_requested") {
    return "deposit_to_pay";
  }
  if (status === "accepted") return "accepted";
  if (effective === "sent" || effective === "viewed") return "to_sign";
  return "accepted";
}

function resolveInvoiceClientStatus(doc: PortalDocumentRow): PortalClientStatus {
  const status = normalizeInvoiceStatus(doc.status);
  const effective = getEffectiveInvoiceStatus(status, doc.due_date);
  if (effective === "paid" || status === "paid") return "paid";
  if (effective === "overdue") return "overdue";
  if (effective === "sent") return "to_pay";
  if (status === "cancelled") return "cancelled";
  return "to_pay";
}

function quotePriority(status: PortalClientStatus): number {
  if (status === "to_sign") return 1;
  if (status === "deposit_to_pay") return 2;
  return 10;
}

function invoicePriority(status: PortalClientStatus): number {
  if (status === "overdue") return 1;
  if (status === "to_pay") return 2;
  return 10;
}

function buildQuoteActions(
  doc: PortalDocumentRow,
  clientStatus: PortalClientStatus,
): PortalDocumentAction[] {
  const token = doc.public_document_token!.trim();
  const actions: PortalDocumentAction[] = ["view", "download_pdf"];
  const quoteStatus = normalizeQuoteStatus(doc.status);

  if (
    clientStatus === "to_sign" &&
    canAcceptQuote(quoteStatus, doc.due_date, doc.converted_to_invoice_id)
  ) {
    actions.push("sign");
  }

  if (
    clientStatus === "deposit_to_pay" &&
    canPayQuoteDeposit({
      status: doc.status,
      quote_deposit_status: doc.quote_deposit_status,
      quote_deposit_amount: doc.quote_deposit_amount ?? null,
      quote_deposit_paid_at: doc.quote_deposit_paid_at ?? null,
    })
  ) {
    actions.push("pay_deposit");
  }

  if (clientStatus === "deposit_paid") {
    actions.push("download_deposit_receipt");
  }

  return actions;
}

function buildInvoiceActions(
  doc: PortalDocumentRow,
  clientStatus: PortalClientStatus,
): PortalDocumentAction[] {
  const actions: PortalDocumentAction[] = ["view", "download_pdf"];

  if (clientStatus === "to_pay" || clientStatus === "overdue") {
    actions.push("pay_invoice");
  }

  if (
    canDownloadPaymentReceipt({
      status: doc.status,
      document_type: "invoice",
      paid_at: doc.paid_at,
    })
  ) {
    actions.push("download_receipt");
  }

  return actions;
}

export function mapDocumentToPortalView(
  doc: PortalDocumentRow,
  displayNumber: string,
): PortalDocumentView | null {
  if (!isPortalDocumentVisible(doc)) return null;

  const kind: PortalDocumentKind =
    doc.document_type === "quote" ? "quote" : "invoice";
  const clientStatus =
    kind === "quote"
      ? resolveQuoteClientStatus(doc)
      : resolveInvoiceClientStatus(doc);

  if (clientStatus === "cancelled") return null;

  return {
    id: doc.id,
    kind,
    number: displayNumber,
    issueDate: doc.issue_date,
    dueDate: doc.due_date,
    totalTtc: Number(doc.total_ttc),
    depositAmount:
      doc.quote_deposit_amount != null
        ? Number(doc.quote_deposit_amount)
        : null,
    publicToken: doc.public_document_token!.trim(),
    clientStatus,
    clientStatusLabel: PORTAL_STATUS_LABELS[clientStatus],
    priority: kind === "quote" ? quotePriority(clientStatus) : invoicePriority(clientStatus),
    actions:
      kind === "quote"
        ? buildQuoteActions(doc, clientStatus)
        : buildInvoiceActions(doc, clientStatus),
  };
}

export function isActionRequired(doc: PortalDocumentView): boolean {
  return (
    doc.clientStatus === "to_sign" ||
    doc.clientStatus === "deposit_to_pay" ||
    doc.clientStatus === "to_pay" ||
    doc.clientStatus === "overdue"
  );
}

export function buildReceiptsFromDocuments(
  documents: PortalDocumentView[],
): PortalReceiptView[] {
  const receipts: PortalReceiptView[] = [];

  for (const doc of documents) {
    if (doc.kind === "invoice" && doc.clientStatus === "paid") {
      receipts.push({
        id: `invoice-receipt-${doc.id}`,
        kind: "invoice_payment",
        label: `Reçu — ${doc.number}`,
        date: doc.dueDate,
        amount: doc.totalTtc,
        publicToken: doc.publicToken,
        downloadUrl: `/api/public/d/${doc.publicToken}/receipt`,
      });
    }

    if (doc.kind === "quote" && doc.clientStatus === "deposit_paid") {
      receipts.push({
        id: `deposit-receipt-${doc.id}`,
        kind: "deposit",
        label: `Reçu acompte — ${doc.number}`,
        date: doc.issueDate,
        amount: doc.depositAmount ?? doc.totalTtc,
        publicToken: doc.publicToken,
        downloadUrl: `/api/public/d/${doc.publicToken}/deposit-receipt`,
      });
    }
  }

  return receipts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export type PortalActionBreakdown = {
  quotesToSign: number;
  depositsToPay: number;
  invoicesToPay: number;
  invoicesOverdue: number;
};

export type PortalSummary = {
  actionRequired: number;
  breakdown: PortalActionBreakdown;
  quotes: number;
  invoices: number;
  receipts: number;
  total: number;
};

export function getPortalActionBreakdown(
  documents: PortalDocumentView[],
): PortalActionBreakdown {
  return {
    quotesToSign: documents.filter((d) => d.clientStatus === "to_sign").length,
    depositsToPay: documents.filter((d) => d.clientStatus === "deposit_to_pay")
      .length,
    invoicesToPay: documents.filter((d) => d.clientStatus === "to_pay").length,
    invoicesOverdue: documents.filter((d) => d.clientStatus === "overdue")
      .length,
  };
}

export function getClientPortalSummary(
  documents: PortalDocumentView[],
  receipts: PortalReceiptView[],
): PortalSummary {
  const quotes = documents.filter((d) => d.kind === "quote").length;
  const invoices = documents.filter((d) => d.kind === "invoice").length;
  const breakdown = getPortalActionBreakdown(documents);
  return {
    actionRequired: documents.filter(isActionRequired).length,
    breakdown,
    quotes,
    invoices,
    receipts: receipts.length,
    total: documents.length,
  };
}

const PRIMARY_ACTION_ORDER: PortalDocumentAction[] = [
  "sign",
  "pay_deposit",
  "pay_invoice",
  "view",
];

export function getPrimaryPortalAction(
  doc: PortalDocumentView,
): PortalDocumentAction {
  for (const action of PRIMARY_ACTION_ORDER) {
    if (doc.actions.includes(action)) return action;
  }
  return "view";
}

export function getSecondaryPortalActions(
  doc: PortalDocumentView,
  primary: PortalDocumentAction,
): PortalDocumentAction[] {
  const secondaries: PortalDocumentAction[] = [];

  if (primary !== "view" && doc.actions.includes("view")) {
    secondaries.push("view");
  }
  if (doc.actions.includes("download_pdf")) {
    secondaries.push("download_pdf");
  }
  if (doc.actions.includes("download_receipt")) {
    secondaries.push("download_receipt");
  }
  if (doc.actions.includes("download_deposit_receipt")) {
    secondaries.push("download_deposit_receipt");
  }

  return secondaries;
}

export function portalActionLabel(action: PortalDocumentAction): string {
  switch (action) {
    case "view":
      return "Voir";
    case "sign":
      return "Signer";
    case "pay_deposit":
      return "Payer l'acompte";
    case "pay_invoice":
      return "Payer";
    case "download_pdf":
      return "PDF";
    case "download_receipt":
      return "Reçu";
    case "download_deposit_receipt":
      return "Reçu acompte";
    default:
      return "Ouvrir";
  }
}

export function portalDocumentHref(
  doc: PortalDocumentView,
  action: PortalDocumentAction,
): string {
  if (action === "download_pdf") {
    return `/api/public/d/${doc.publicToken}/pdf`;
  }
  if (action === "download_receipt") {
    return `/api/public/d/${doc.publicToken}/receipt`;
  }
  if (action === "download_deposit_receipt") {
    return `/api/public/d/${doc.publicToken}/deposit-receipt`;
  }
  return buildPublicDocumentUrl(doc.publicToken);
}

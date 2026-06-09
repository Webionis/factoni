import type { InvoiceDetail } from "@/lib/data/invoices";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { buildPaymentReceiptFilename } from "@/lib/pdf/filenames";
import { formatPdfDate, formatPdfDateTime } from "@/lib/pdf/format";
import {
  parseClientSnapshot,
  parseCompanySnapshot,
} from "@/lib/pdf/parse-snapshots";
import type { PaymentReceiptPdfData } from "@/lib/pdf/receipt-types";
import type { PdfParty } from "@/lib/pdf/types";
import type { Database } from "@/types/database";

const EMPTY_PARTY: PdfParty = {
  name: "—",
  addressLines: [],
};

type ReceiptSource = Pick<
  Database["public"]["Tables"]["invoices"]["Row"],
  | "id"
  | "invoice_number"
  | "issue_date"
  | "due_date"
  | "total_ttc"
  | "paid_at"
  | "stripe_payment_intent_id"
  | "stripe_checkout_session_id"
  | "client_snapshot"
  | "company_snapshot"
>;

function partyFromInvoiceDetail(invoice: InvoiceDetail): {
  client: PdfParty;
  emitter: PdfParty;
} {
  const clientFromSnapshot = parseClientSnapshot(invoice.client_snapshot);
  const companyFromSnapshot = parseCompanySnapshot(invoice.company_snapshot);

  let client = clientFromSnapshot ?? EMPTY_PARTY;
  let emitter = companyFromSnapshot?.party ?? EMPTY_PARTY;

  if (!clientFromSnapshot && invoice.clients) {
    const c = invoice.clients;
    const displayName =
      c.client_type === "company" && c.company_name ? c.company_name : c.name;
    client = {
      name: displayName,
      subtitle:
        c.client_type === "company" && c.company_name ? c.name : null,
      addressLines: [],
      email: c.email,
    };
  }

  return { client, emitter };
}

export function preparePaymentReceiptPdfData(
  invoice: ReceiptSource & { clients?: InvoiceDetail["clients"] },
): PaymentReceiptPdfData {
  if (!invoice.paid_at) {
    throw new Error("Date de paiement manquante");
  }

  const detail = invoice as InvoiceDetail;
  const { client, emitter } = partyFromInvoiceDetail(detail);
  const invoiceNumber = invoiceDisplayNumber(
    invoice.invoice_number,
    invoice.id,
  );
  return {
    filename: buildPaymentReceiptFilename(
      invoice.invoice_number,
      invoice.id,
    ),
    invoiceNumber,
    issueDate: formatPdfDate(invoice.issue_date),
    dueDate: formatPdfDate(invoice.due_date),
    totalTtc: Number(invoice.total_ttc),
    paidAt: formatPdfDateTime(invoice.paid_at),
    paymentMethod: "Carte bancaire (Stripe)",
    currency: "EUR",
    stripePaymentIntentId: invoice.stripe_payment_intent_id,
    stripeCheckoutSessionId: invoice.stripe_checkout_session_id,
    client,
    emitter,
    generatedAt: formatPdfDateTime(new Date().toISOString()),
  };
}

import type { QuoteDetail } from "@/lib/data/quotes";
import { formatPdfDateTime } from "@/lib/pdf/format";
import type { DepositReceiptPdfData } from "@/lib/pdf/deposit-receipt-types";
import {
  parseClientSnapshot,
  parseCompanySnapshot,
} from "@/lib/pdf/parse-snapshots";
import type { PdfParty } from "@/lib/pdf/types";
import { quoteDisplayNumber } from "@/lib/quotes/status";

const EMPTY_PARTY: PdfParty = {
  name: "—",
  addressLines: [],
};

function partiesFromQuote(quote: QuoteDetail): {
  client: PdfParty;
  emitter: PdfParty;
} {
  const clientFromSnapshot = parseClientSnapshot(quote.client_snapshot);
  const companyFromSnapshot = parseCompanySnapshot(quote.company_snapshot);

  let client = clientFromSnapshot ?? EMPTY_PARTY;
  const emitter = companyFromSnapshot?.party ?? EMPTY_PARTY;

  if (!clientFromSnapshot && quote.clients) {
    const c = quote.clients;
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

export function prepareDepositReceiptPdfData(
  quote: QuoteDetail,
): DepositReceiptPdfData {
  if (!quote.quote_deposit_paid_at) {
    throw new Error("Date de paiement acompte manquante");
  }

  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const { client, emitter } = partiesFromQuote(quote);
  const depositAmount = Number(quote.quote_deposit_amount);

  return {
    filename: `recu-acompte-${quoteNumber.replace(/[^a-zA-Z0-9-]+/g, "-")}.pdf`,
    quoteNumber,
    paidAt: formatPdfDateTime(quote.quote_deposit_paid_at),
    depositAmount,
    currency: "EUR",
    stripePaymentIntentId: quote.deposit_payment_intent_id,
    stripeCheckoutSessionId: quote.deposit_checkout_session_id,
    client,
    emitter,
    generatedAt: formatPdfDateTime(new Date().toISOString()),
  };
}

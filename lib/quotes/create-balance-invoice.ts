import { addOneMonthToIsoDate, todayIsoDate } from "@/lib/dates/invoice-dates";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import type { QuoteDetail } from "@/lib/data/quotes";
import { calculateLinesAndTotals, roundMoney } from "@/lib/invoices/calculate";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { sanitizeText } from "@/lib/sanitize";
import { logServerError } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = ReturnType<typeof createAdminClient>;
type DbClient = SupabaseClient<Database> | AdminClient;
type LineInsert = Database["public"]["Tables"]["invoice_lines"]["Insert"];

async function resolveVatRegime(
  client: DbClient,
  companyId: string,
): Promise<Database["public"]["Enums"]["vat_regime"]> {
  const { data } = await client
    .from("companies")
    .select("vat_regime")
    .eq("id", companyId)
    .maybeSingle();
  return data?.vat_regime ?? "standard";
}

function scaleQuoteLinesForBalance(quote: QuoteDetail, remainingTtc: number) {
  const totalTtc = Number(quote.total_ttc);
  const ratio = totalTtc > 0 ? remainingTtc / totalTtc : 1;

  return quote.invoice_lines.map((line) => {
    const lineTtc = Number(line.line_total_ttc);
    const scaledTtc = roundMoney(lineTtc * ratio);
    const vatRate = Number(line.vat_rate);
    const scaledHt =
      vatRate > 0 ? roundMoney(scaledTtc / (1 + vatRate / 100)) : scaledTtc;
    const qty = Number(line.quantity);
    const unitHt = qty > 0 ? roundMoney(scaledHt / qty) : scaledHt;

    return {
      description: line.description,
      quantity: qty,
      unit_price_ht: unitHt,
      vat_rate: vatRate,
    };
  });
}

export async function createDepositPaidInvoice(
  client: DbClient,
  quote: QuoteDetail,
  depositAmount: number,
  paidAt: string,
  stripeRefs: {
    paymentIntentId: string | null;
    checkoutSessionId: string;
  },
): Promise<string | null> {
  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const vatRate =
    Number(quote.total_ht) > 0
      ? roundMoney((Number(quote.total_vat) / Number(quote.total_ht)) * 100)
      : 0;
  const depositHt =
    vatRate > 0
      ? roundMoney(depositAmount / (1 + vatRate / 100))
      : depositAmount;
  const depositVat = roundMoney(depositAmount - depositHt);

  const { data: invoice, error } = await client
    .from("invoices")
    .insert({
      user_id: quote.user_id,
      company_id: quote.company_id,
      client_id: quote.client_id,
      document_type: "invoice",
      source_quote_id: quote.id,
      issue_date: todayIsoDate(),
      due_date: todayIsoDate(),
      status: "paid",
      paid_at: paidAt,
      notes: `Acompte reçu pour le devis ${quoteNumber}`,
      payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
      client_snapshot: quote.client_snapshot,
      company_snapshot: quote.company_snapshot,
      total_ht: depositHt,
      total_vat: depositVat,
      total_ttc: depositAmount,
      stripe_payment_intent_id: stripeRefs.paymentIntentId,
      stripe_checkout_session_id: stripeRefs.checkoutSessionId,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    logServerError("createDepositPaidInvoice", error, { quoteId: quote.id });
    return null;
  }

  const { error: lineError } = await client.from("invoice_lines").insert({
    invoice_id: invoice.id,
    description: `Acompte — Devis ${quoteNumber}`,
    quantity: 1,
    unit_price_ht: depositHt,
    vat_rate: vatRate,
    line_total_ht: depositHt,
    line_vat: depositVat,
    line_total_ttc: depositAmount,
    sort_order: 0,
  });

  if (lineError) {
    await client.from("invoices").delete().eq("id", invoice.id);
    return null;
  }

  return invoice.id;
}

export async function createBalanceInvoiceFromQuote(
  client: DbClient,
  quote: QuoteDetail,
  depositAmount: number,
  remainingBalance: number,
): Promise<string | null> {
  const quoteNumber = quoteDisplayNumber(quote.invoice_number, quote.id);
  const today = todayIsoDate();
  const vatRegime = await resolveVatRegime(client, quote.company_id);
  const scaledLines = scaleQuoteLinesForBalance(quote, remainingBalance);

  const discounts = {
    discount_percent: quote.discount_percent,
    discount_amount: quote.discount_amount,
  };

  const { totals, calculatedLines } = calculateLinesAndTotals(
    scaledLines.map((l) => ({
      quantity: l.quantity,
      unit_price_ht: l.unit_price_ht,
      vat_rate: l.vat_rate,
    })),
    vatRegime,
    discounts,
  );

  const balanceNotes = [
    quote.notes?.trim(),
    `Solde suite acompte de ${depositAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € sur le devis ${quoteNumber}.`,
    `Prestation totale : ${Number(quote.total_ttc).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € TTC.`,
    `Acompte déjà réglé : -${depositAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €.`,
    `Reste dû : ${remainingBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € TTC.`,
  ]
    .filter(Boolean)
    .join("\n");

  const { data: invoice, error } = await client
    .from("invoices")
    .insert({
      user_id: quote.user_id,
      company_id: quote.company_id,
      client_id: quote.client_id,
      document_type: "invoice",
      source_quote_id: quote.id,
      issue_date: today,
      due_date: addOneMonthToIsoDate(today) ?? today,
      status: "draft",
      notes: balanceNotes,
      payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
      client_snapshot: quote.client_snapshot,
      company_snapshot: quote.company_snapshot,
      discount_percent: quote.discount_percent,
      discount_amount: quote.discount_amount,
      deposit_applied_amount: depositAmount,
      total_ht: totals.total_ht,
      total_vat: totals.total_vat,
      total_ttc: totals.total_ttc,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    logServerError("createBalanceInvoiceFromQuote", error, { quoteId: quote.id });
    return null;
  }

  const lineRows: LineInsert[] = scaledLines.map((line, index) => {
    const calc = calculatedLines[index];
    return {
      invoice_id: invoice.id,
      sort_order: index,
      description: sanitizeText(line.description),
      quantity: line.quantity,
      unit_price_ht: line.unit_price_ht,
      vat_rate: vatRegime === "franchise" ? 0 : line.vat_rate,
      line_total_ht: calc.line_total_ht,
      line_vat: calc.line_vat,
      line_total_ttc: calc.line_total_ttc,
    };
  });

  const { error: linesError } = await client.from("invoice_lines").insert(lineRows);

  if (linesError) {
    logServerError("createBalanceInvoiceFromQuote.lines", linesError, {
      quoteId: quote.id,
      invoiceId: invoice.id,
    });
    await client.from("invoices").delete().eq("id", invoice.id);
    return null;
  }

  return invoice.id;
}

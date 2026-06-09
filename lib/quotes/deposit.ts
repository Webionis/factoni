import { roundMoney } from "@/lib/invoices/calculate";
import type { QuoteDetail } from "@/lib/data/quotes";
import type { Database } from "@/types/database";
import type { QuoteStatus } from "@/lib/quotes/status";

export type QuoteDepositType = Database["public"]["Enums"]["quote_deposit_type"];
export type QuoteDepositStatus =
  Database["public"]["Enums"]["quote_deposit_status"];

export type DepositCalculation = {
  depositAmount: number;
  remainingBalance: number;
  depositPercentLabel: string | null;
};

export function normalizeQuoteDepositStatus(
  value: string | null | undefined,
): QuoteDepositStatus {
  if (value === "requested" || value === "paid") return value;
  return "none";
}

export function calculateDepositAmount(
  totalTtc: number,
  type: QuoteDepositType,
  value: number,
): DepositCalculation {
  const total = roundMoney(totalTtc);
  let depositAmount: number;

  if (type === "percent") {
    depositAmount = roundMoney((total * value) / 100);
  } else {
    depositAmount = roundMoney(value);
  }

  const remainingBalance = roundMoney(Math.max(0, total - depositAmount));
  const depositPercentLabel =
    type === "percent" ? `${value} %` : null;

  return { depositAmount, remainingBalance, depositPercentLabel };
}

export function validateDepositRequest(params: {
  quoteStatus: QuoteStatus;
  depositStatus: QuoteDepositStatus;
  totalTtc: number;
  type: QuoteDepositType;
  value: number;
}): string | null {
  const { quoteStatus, depositStatus, totalTtc, type, value } = params;

  if (quoteStatus !== "accepted") {
    return "L'acompte ne peut être demandé que sur un devis accepté.";
  }

  if (depositStatus === "paid") {
    return "L'acompte a déjà été réglé.";
  }

  if (depositStatus === "requested") {
    return "Un acompte a déjà été demandé pour ce devis.";
  }

  if (!Number.isFinite(totalTtc) || totalTtc <= 0) {
    return "Montant du devis invalide.";
  }

  if (!Number.isFinite(value) || value <= 0) {
    return "Montant d'acompte invalide.";
  }

  if (type === "percent") {
    if (value > 100) {
      return "Le pourcentage d'acompte ne peut pas dépasser 100 %.";
    }
  } else if (value > totalTtc) {
    return "L'acompte ne peut pas dépasser le montant total du devis.";
  }

  const { depositAmount } = calculateDepositAmount(totalTtc, type, value);
  if (depositAmount <= 0) {
    return "Le montant d'acompte doit être positif.";
  }
  if (depositAmount >= totalTtc) {
    return "L'acompte doit être inférieur au montant total du devis.";
  }

  return null;
}

export function canRequestQuoteDeposit(quote: QuoteDetail): boolean {
  const status = quote.status as QuoteStatus;
  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);
  return (
    status === "accepted" &&
    depositStatus === "none" &&
    !quote.quote_balance_invoice_id &&
    !quote.converted_to_invoice_id
  );
}

export function canPayQuoteDeposit(quote: {
  status: string;
  quote_deposit_status: string | null;
  quote_deposit_amount: number | null;
  quote_deposit_paid_at: string | null;
}): boolean {
  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);
  return (
    (quote.status === "accepted" || quote.status === "deposit_requested") &&
    depositStatus === "requested" &&
    !quote.quote_deposit_paid_at &&
    Number(quote.quote_deposit_amount) > 0
  );
}

export function formatDepositTypeLabel(
  type: QuoteDepositType | null,
  value: number | null,
): string {
  if (!type || value == null) return "";
  if (type === "percent") return `${value} %`;
  return `${roundMoney(value).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Source de vérité affichage acompte : quote_deposit_status (+ paid_at). */
export function isQuoteDepositPaid(quote: {
  quote_deposit_status: string | null;
  quote_deposit_paid_at?: string | null;
}): boolean {
  return normalizeQuoteDepositStatus(quote.quote_deposit_status) === "paid";
}

export function getQuoteDepositInfo(quote: QuoteDetail) {
  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);
  const type = quote.quote_deposit_type;
  const value = quote.quote_deposit_value != null ? Number(quote.quote_deposit_value) : null;
  const depositAmount =
    quote.quote_deposit_amount != null ? Number(quote.quote_deposit_amount) : null;
  const remainingBalance =
    quote.remaining_balance_amount != null
      ? Number(quote.remaining_balance_amount)
      : depositAmount != null
        ? roundMoney(Number(quote.total_ttc) - depositAmount)
        : null;

  return {
    depositStatus,
    type,
    value,
    depositAmount,
    remainingBalance,
    paidAt: quote.quote_deposit_paid_at,
    depositInvoiceId: quote.quote_deposit_invoice_id,
    balanceInvoiceId: quote.quote_balance_invoice_id,
    typeLabel: type && value != null ? formatDepositTypeLabel(type, value) : null,
  };
}

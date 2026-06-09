"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getQuoteById } from "@/lib/data/quotes";
import { normalizeQuoteDepositStatus } from "@/lib/quotes/deposit";
import { createBalanceInvoiceFromQuote } from "@/lib/quotes/create-balance-invoice";
import { normalizeQuoteStatus } from "@/lib/quotes/status";

export async function openOrCreateBalanceInvoiceAction(
  quoteId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const quote = await getQuoteById(supabase, quoteId);
  if (!quote || quote.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  const quoteStatus = normalizeQuoteStatus(quote.status);
  const depositStatus = normalizeQuoteDepositStatus(quote.quote_deposit_status);

  if (quoteStatus !== "deposit_paid" || depositStatus !== "paid") {
    return { error: "La facture de solde n'est disponible qu'après paiement de l'acompte." };
  }

  if (quote.quote_balance_invoice_id) {
    revalidatePath(`/quotes/${quoteId}`);
    revalidatePath(`/invoices/${quote.quote_balance_invoice_id}`);
    redirect(`/invoices/${quote.quote_balance_invoice_id}/edit`);
  }

  const depositAmount = Number(quote.quote_deposit_amount);
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return { error: "Montant d'acompte invalide." };
  }

  const remainingBalance =
    quote.remaining_balance_amount != null
      ? Number(quote.remaining_balance_amount)
      : Number(quote.total_ttc) - depositAmount;

  if (!Number.isFinite(remainingBalance) || remainingBalance <= 0) {
    return { error: "Le reste à facturer est invalide." };
  }

  const balanceInvoiceId = await createBalanceInvoiceFromQuote(
    supabase,
    quote,
    depositAmount,
    remainingBalance,
  );

  if (!balanceInvoiceId) {
    return { error: "Impossible de créer la facture de solde. Réessayez." };
  }

  const { error: linkError } = await supabase
    .from("invoices")
    .update({ quote_balance_invoice_id: balanceInvoiceId })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote")
    .is("quote_balance_invoice_id", null);

  if (linkError) {
    const { data: current } = await supabase
      .from("invoices")
      .select("quote_balance_invoice_id")
      .eq("id", quoteId)
      .maybeSingle();

    if (current?.quote_balance_invoice_id) {
      redirect(`/invoices/${current.quote_balance_invoice_id}/edit`);
    }

    await supabase.from("invoices").delete().eq("id", balanceInvoiceId);
    return actionErrorFromSupabase(linkError, "Erreur lors de la liaison de la facture");
  }

  revalidatePath("/quotes");
  revalidatePath("/invoices");
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/invoices/${balanceInvoiceId}`);
  redirect(`/invoices/${balanceInvoiceId}/edit`);
}

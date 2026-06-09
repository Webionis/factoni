"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import { getCompanyForUser } from "@/lib/auth/profile";
import { getClientById } from "@/lib/data/clients";
import { getQuoteById } from "@/lib/data/quotes";
import { calculateLinesAndTotals } from "@/lib/invoices/calculate";
import { buildClientSnapshot, buildCompanySnapshot } from "@/lib/invoices/snapshots";
import { ensurePublicDocumentUrl } from "@/lib/data/public-documents";
import { invoiceToDuplicateFormValues } from "@/lib/invoices/duplicate";
import { canRestoreInvoice } from "@/lib/invoices/archive";
import { quoteToInvoiceFormValues } from "@/lib/quotes/convert";
import { transitionQuoteReadyToSent } from "@/lib/quotes/send-quote";
import {
  canConvertQuoteToInvoice,
  canAcceptQuote,
} from "@/lib/quotes/expiry";
import {
  canCopyQuotePublicLink,
  canTransitionQuoteStatus,
  canValidateQuoteDraft,
  isQuoteStatus,
  normalizeQuoteStatus,
  type QuoteStatus,
} from "@/lib/quotes/status";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import {
  invoiceFormSchema,
  parseInvoiceDiscounts,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import type { Database } from "@/types/database";

type LineInsert = Database["public"]["Tables"]["invoice_lines"]["Insert"];

async function requireCompany(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
) {
  const company = await getCompanyForUser(supabase, userId);
  if (!company) {
    return null;
  }
  return company;
}

function buildLineInserts(
  invoiceId: string,
  formLines: InvoiceFormValues["lines"],
  vatRegime: Database["public"]["Enums"]["vat_regime"],
): LineInsert[] {
  const { calculatedLines } = calculateLinesAndTotals(
    formLines.map((l) => ({
      quantity: Number(l.quantity),
      unit_price_ht: Number(l.unit_price_ht),
      vat_rate: Number(l.vat_rate),
    })),
    vatRegime,
  );

  return formLines.map((line, index) => {
    const calc = calculatedLines[index];
    return {
      invoice_id: invoiceId,
      sort_order: index,
      description: sanitizeText(line.description),
      quantity: Number(line.quantity),
      unit_price_ht: Number(line.unit_price_ht),
      vat_rate: vatRegime === "franchise" ? 0 : Number(line.vat_rate),
      line_total_ht: calc.line_total_ht,
      line_vat: calc.line_vat,
      line_total_ttc: calc.line_total_ttc,
    };
  });
}

function computeTotalsPayload(
  form: InvoiceFormValues,
  vatRegime: Database["public"]["Enums"]["vat_regime"],
) {
  const discounts = parseInvoiceDiscounts(form);
  const { totals } = calculateLinesAndTotals(
    form.lines.map((l) => ({
      quantity: Number(l.quantity),
      unit_price_ht: Number(l.unit_price_ht),
      vat_rate: Number(l.vat_rate),
    })),
    vatRegime,
    discounts,
  );

  return {
    total_ht: totals.total_ht,
    total_vat: totals.total_vat,
    total_ttc: totals.total_ttc,
  };
}

export async function createQuoteAction(
  rawValues: InvoiceFormValues,
): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise avant de créer un devis." };
  }

  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const totals = computeTotalsPayload(parsed.data, company.vat_regime);
  const discounts = parseInvoiceDiscounts(parsed.data);

  const { data: quote, error: quoteError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      company_id: company.id,
      client_id: parsed.data.client_id,
      document_type: "quote",
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      status: "draft",
      notes: sanitizeOptionalText(parsed.data.notes),
      payment_terms:
        sanitizeOptionalText(parsed.data.payment_terms) ||
        DEFAULT_INVOICE_PAYMENT_TERM,
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .select("id")
    .single();

  if (quoteError || !quote) {
    return actionErrorFromSupabase(quoteError, "Erreur création devis");
  }

  const lineRows = buildLineInserts(quote.id, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    await supabase.from("invoices").delete().eq("id", quote.id);
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuoteAction(
  quoteId: string,
  rawValues: InvoiceFormValues,
): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }
  if (existing.status !== "draft") {
    return { error: "Seuls les brouillons sont modifiables." };
  }

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise." };
  }

  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const totals = computeTotalsPayload(parsed.data, company.vat_regime);
  const discounts = parseInvoiceDiscounts(parsed.data);

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      client_id: parsed.data.client_id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      notes: sanitizeOptionalText(parsed.data.notes),
      payment_terms:
        sanitizeOptionalText(parsed.data.payment_terms) ||
        DEFAULT_INVOICE_PAYMENT_TERM,
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote");

  if (updateError) {
    return actionErrorFromSupabase(updateError);
  }

  const { error: deleteLinesError } = await supabase
    .from("invoice_lines")
    .delete()
    .eq("invoice_id", quoteId);

  if (deleteLinesError) {
    return actionErrorFromSupabase(deleteLinesError);
  }

  const lineRows = buildLineInserts(quoteId, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/quotes/${quoteId}/edit`);
  return { success: true };
}

export async function changeQuoteStatusAction(
  quoteId: string,
  newStatus: QuoteStatus,
): Promise<ActionResult> {
  if (!isQuoteStatus(newStatus)) {
    return { error: "Statut invalide." };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Restaurez le devis avant de modifier son statut." };
  }

  if (!canTransitionQuoteStatus(existing.status as QuoteStatus, newStatus)) {
    return {
      error: `Transition impossible : ${existing.status} → ${newStatus}`,
    };
  }

  if (newStatus === "sent") {
    const sendResult = await sendQuoteAction(quoteId);
    if (sendResult.error) {
      return { error: sendResult.error };
    }
  } else if (newStatus === "ready") {
    const validateResult = await validateQuoteDraftAction(quoteId);
    if (validateResult.error) {
      return { error: validateResult.error };
    }
  } else {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .eq("document_type", "quote");

    if (error) {
      return actionErrorFromSupabase(error);
    }
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  return { success: true };
}

/** Valide un brouillon devis : fige le contenu, numéro DV, lien public. draft → ready */
export async function validateQuoteDraftAction(
  quoteId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Ce devis est archivé." };
  }

  const status = normalizeQuoteStatus(existing.status);
  if (!canValidateQuoteDraft(status)) {
    return { error: "Seuls les brouillons peuvent être validés." };
  }

  const lines = existing.invoice_lines ?? [];
  if (lines.length === 0) {
    return { error: "Ajoutez au moins une ligne avant de valider." };
  }

  const client = await getClientById(supabase, existing.client_id);
  const company = await getCompanyForUser(supabase, user.id);
  if (!client || !company) {
    return { error: "Client ou entreprise introuvable." };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, quoteId, user.id);
  if (!urlResult.ok) {
    return { error: urlResult.error };
  }

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "ready",
      client_snapshot: buildClientSnapshot(client),
      company_snapshot: buildCompanySnapshot(company),
    })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote")
    .eq("status", "draft");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  revalidatePath(`/quotes/${quoteId}/edit`);
  return { success: true };
}

/** Envoi réel au client : ready → sent */
export async function sendQuoteAction(quoteId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const existing = await getQuoteById(auth.supabase, quoteId);
  if (!existing?.invoice_lines?.length) {
    return { error: "Ajoutez au moins une ligne avant d'envoyer." };
  }

  const result = await transitionQuoteReadyToSent(
    auth.supabase,
    auth.user.id,
    quoteId,
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  return { success: true };
}

/** Lien public client — uniquement après envoi (sent / viewed), sans changer le statut. */
export async function getQuotePublicLinkAction(
  quoteId: string,
): Promise<{ url: string } | { error: string }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Ce devis est archivé." };
  }

  const status = normalizeQuoteStatus(existing.status);
  if (!canCopyQuotePublicLink(status)) {
    return { error: "Ce devis n'a pas de lien public partageable." };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, quoteId, user.id);
  if (!urlResult.ok) {
    return { error: urlResult.error };
  }

  return { url: urlResult.url };
}

export async function duplicateQuoteAction(
  sourceQuoteId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const source = await getQuoteById(supabase, sourceQuoteId);
  if (!source || source.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (!source.invoice_lines.length) {
    return { error: "Impossible de dupliquer un devis sans lignes." };
  }

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise." };
  }

  const formValues = invoiceToDuplicateFormValues(source);
  const parsed = invoiceFormSchema.safeParse(formValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const totals = computeTotalsPayload(parsed.data, company.vat_regime);
  const discounts = parseInvoiceDiscounts(parsed.data);

  const { data: quote, error: quoteError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      company_id: company.id,
      client_id: parsed.data.client_id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      document_type: "quote",
      status: "draft",
      invoice_number: null,
      client_snapshot: null,
      company_snapshot: null,
      notes: sanitizeOptionalText(parsed.data.notes),
      payment_terms: sanitizeOptionalText(parsed.data.payment_terms),
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .select("id")
    .single();

  if (quoteError || !quote) {
    return actionErrorFromSupabase(quoteError, "Erreur lors de la duplication");
  }

  const lineRows = buildLineInserts(quote.id, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    await supabase.from("invoices").delete().eq("id", quote.id);
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  redirect(`/quotes/${quote.id}/edit`);
}

export async function acceptQuoteAction(quoteId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (
    !canAcceptQuote(
      existing.status as QuoteStatus,
      existing.due_date,
      existing.converted_to_invoice_id,
    )
  ) {
    return { error: "Ce devis ne peut pas être accepté dans son état actuel." };
  }

  return changeQuoteStatusAction(quoteId, "accepted");
}

export async function rejectQuoteAction(quoteId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  const status = existing.status as QuoteStatus;
  if (status !== "sent" && status !== "viewed") {
    return { error: "Seuls les devis envoyés peuvent être refusés." };
  }

  return changeQuoteStatusAction(quoteId, "rejected");
}

export async function convertQuoteToInvoiceAction(
  quoteId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const quote = await getQuoteById(supabase, quoteId);
  if (!quote || quote.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (
    !canConvertQuoteToInvoice(
      quote.status as QuoteStatus,
      quote.converted_to_invoice_id,
      quote.quote_deposit_status,
    )
  ) {
    return { error: "Seuls les devis acceptés peuvent être transformés en facture." };
  }

  if (!quote.invoice_lines.length) {
    return { error: "Le devis ne contient aucune ligne." };
  }

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise." };
  }

  const formValues = quoteToInvoiceFormValues(quote);
  const parsed = invoiceFormSchema.safeParse(formValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const totals = computeTotalsPayload(parsed.data, company.vat_regime);
  const discounts = parseInvoiceDiscounts(parsed.data);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      company_id: company.id,
      client_id: parsed.data.client_id,
      document_type: "invoice",
      source_quote_id: quote.id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      status: "draft",
      notes: sanitizeOptionalText(parsed.data.notes),
      payment_terms: sanitizeOptionalText(parsed.data.payment_terms),
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    return actionErrorFromSupabase(invoiceError, "Erreur création facture");
  }

  const lineRows = buildLineInserts(invoice.id, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return actionErrorFromSupabase(linesError);
  }

  const { error: linkError } = await supabase
    .from("invoices")
    .update({ converted_to_invoice_id: invoice.id })
    .eq("id", quote.id)
    .eq("user_id", user.id);

  if (linkError) {
    return actionErrorFromSupabase(linkError);
  }

  revalidatePath("/quotes");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  redirect(`/invoices/${invoice.id}/edit`);
}

export async function deleteDraftQuoteAction(
  quoteId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }
  if (existing.status !== "draft") {
    return { error: "Seuls les brouillons peuvent être supprimés." };
  }

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  redirect("/quotes");
}

export async function archiveQuoteAction(quoteId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  const status = normalizeQuoteStatus(existing.status);
  if (status === "draft" || status === "ready" || existing.archived_at) {
    return {
      error:
        status === "draft"
          ? "Les brouillons se suppriment définitivement."
          : status === "ready"
            ? "Les devis prêts à envoyer ne peuvent pas être archivés."
            : "Ce devis est déjà archivé.",
    };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  return { success: true };
}

export async function restoreQuoteAction(quoteId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getQuoteById(supabase, quoteId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (!canRestoreInvoice(existing.archived_at)) {
    return { error: "Ce devis n'est pas archivé." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ archived_at: null })
    .eq("id", quoteId)
    .eq("user_id", user.id)
    .eq("document_type", "quote");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  revalidatePath(`/quotes/${quoteId}`);
  return { success: true };
}

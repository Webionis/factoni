"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import { invoiceToDuplicateFormValues } from "@/lib/invoices/duplicate";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import { getCompanyForUser } from "@/lib/auth/profile";
import { getClientById } from "@/lib/data/clients";
import { getInvoiceById } from "@/lib/data/invoices";
import { calculateLinesAndTotals } from "@/lib/invoices/calculate";
import { buildClientSnapshot, buildCompanySnapshot } from "@/lib/invoices/snapshots";
import {
  canArchiveInvoice,
  canRestoreInvoice,
} from "@/lib/invoices/archive";
import { ensurePublicDocumentUrl } from "@/lib/data/public-documents";
import { logServerError } from "@/lib/logger";
import { transitionInvoiceReadyToSent } from "@/lib/invoices/send-invoice";
import {
  canCopyInvoicePublicLink,
  canRevertInvoiceToDraft,
  canTransitionStatus,
  canValidateInvoiceDraft,
  toInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/invoices/status";
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
      vat_rate:
        vatRegime === "franchise" ? 0 : Number(line.vat_rate),
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

export async function createInvoiceAction(
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
    return { error: "Complétez votre profil entreprise avant de facturer." };
  }

  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const totals = computeTotalsPayload(parsed.data, company.vat_regime);
  const discounts = parseInvoiceDiscounts(parsed.data);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      company_id: company.id,
      client_id: parsed.data.client_id,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      document_type: "invoice",
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

  if (invoiceError || !invoice) {
    return actionErrorFromSupabase(invoiceError, "Erreur création facture");
  }

  const lineRows = buildLineInserts(invoice.id, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}`);
}

export async function duplicateInvoiceAction(
  sourceInvoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const source = await getInvoiceById(supabase, sourceInvoiceId);
  if (!source || source.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (!source.invoice_lines.length) {
    return { error: "Impossible de dupliquer une facture sans lignes." };
  }

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise avant de facturer." };
  }

  const formValues = invoiceToDuplicateFormValues(source);
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
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date,
      document_type: "invoice",
      status: "draft",
      invoice_number: null,
      client_snapshot: null,
      company_snapshot: null,
      notes: sanitizeOptionalText(parsed.data.notes),
      payment_terms:
        sanitizeOptionalText(parsed.data.payment_terms) ||
        company.payment_terms ||
        null,
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    return actionErrorFromSupabase(invoiceError, "Erreur lors de la duplication");
  }

  const lineRows = buildLineInserts(invoice.id, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}/edit`);
}

export async function updateInvoiceAction(
  invoiceId: string,
  rawValues: InvoiceFormValues,
): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }
  if (existing.status !== "draft") {
    return { error: "Seuls les brouillons sont modifiables." };
  }

  const company = await requireCompany(supabase, user.id);
  if (!company) {
    return { error: "Complétez votre profil entreprise avant de facturer." };
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
      payment_terms: sanitizeOptionalText(parsed.data.payment_terms),
      discount_percent: discounts.discount_percent,
      discount_amount: discounts.discount_amount,
      ...totals,
    })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (updateError) {
    return actionErrorFromSupabase(updateError);
  }

  const { error: deleteLinesError } = await supabase
    .from("invoice_lines")
    .delete()
    .eq("invoice_id", invoiceId);

  if (deleteLinesError) {
    return actionErrorFromSupabase(deleteLinesError);
  }

  const lineRows = buildLineInserts(invoiceId, parsed.data.lines, company.vat_regime);
  const { error: linesError } = await supabase.from("invoice_lines").insert(lineRows);

  if (linesError) {
    return actionErrorFromSupabase(linesError);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/invoices/${invoiceId}/edit`);
  return { success: true };
}

export async function changeInvoiceStatusAction(
  invoiceId: string,
  newStatus: InvoiceStatus,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (existing.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Restaurez la facture avant de modifier son statut." };
  }

  const currentStatus = toInvoiceStatus(existing.status);
  if (!canTransitionStatus(currentStatus, newStatus)) {
    return {
      error: `Transition impossible : ${currentStatus} → ${newStatus}`,
    };
  }

  if (newStatus === "sent") {
    const sendResult = await sendInvoiceAction(invoiceId);
    if (sendResult.error) {
      return { error: sendResult.error };
    }
  } else if (newStatus === "ready") {
    const validateResult = await validateInvoiceDraftAction(invoiceId);
    if (validateResult.error) {
      return { error: validateResult.error };
    }
  } else if (newStatus === "draft" && currentStatus === "ready") {
    const revertResult = await revertInvoiceToDraftAction(invoiceId);
    if (revertResult.error) {
      return { error: revertResult.error };
    }
  } else if (newStatus === "paid") {
    const paidAt = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: paidAt })
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .in("status", ["sent", "overdue"])
      .select("id, status, paid_at")
      .maybeSingle();

    if (error) {
      return actionErrorFromSupabase(error);
    }

    if (!updated || updated.status !== "paid") {
      return { error: "Impossible de marquer la facture comme payée." };
    }

    try {
      const { runInvoicePaidSideEffects } = await import(
        "@/lib/invoices/schedule-invoice-paid-side-effects"
      );
      await runInvoicePaidSideEffects(invoiceId, {
        source: "manual_mark_paid",
        transitioned: true,
        previousStatus: currentStatus,
        paidAt: updated.paid_at ?? paidAt,
      });
    } catch (notifyError) {
      logServerError("changeInvoiceStatusAction.paidNotify", notifyError, {
        invoiceId,
      });
    }
  } else {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (error) {
      return actionErrorFromSupabase(error);
    }
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

/** Valide un brouillon : fige le contenu, numéro légal, lien public. draft → ready */
export async function validateInvoiceDraftAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (existing.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Cette facture est archivée." };
  }

  const status = toInvoiceStatus(existing.status);
  if (!canValidateInvoiceDraft(status)) {
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

  const urlResult = await ensurePublicDocumentUrl(supabase, invoiceId, user.id);
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
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .eq("document_type", "invoice")
    .eq("status", "draft");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/invoices/${invoiceId}/edit`);
  return { success: true };
}

/** Envoi réel au client : ready → sent (sent_at via trigger DB). */
export async function sendInvoiceAction(invoiceId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const existing = await getInvoiceById(auth.supabase, invoiceId);
  if (!existing?.invoice_lines?.length) {
    return { error: "Ajoutez au moins une ligne avant d'envoyer." };
  }

  const result = await transitionInvoiceReadyToSent(
    auth.supabase,
    auth.user.id,
    invoiceId,
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

/** Revenir en brouillon depuis ready (réédition autorisée). */
export async function revertInvoiceToDraftAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  const status = toInvoiceStatus(existing.status);
  if (!canRevertInvoiceToDraft(status)) {
    return { error: "Seules les factures prêtes à envoyer peuvent repasser en brouillon." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "draft" })
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .eq("document_type", "invoice")
    .eq("status", "ready");

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/invoices/${invoiceId}/edit`);
  return { success: true };
}

/** Lien public client — uniquement après envoi (sent / overdue), sans changer le statut. */
export async function getInvoicePublicLinkAction(
  invoiceId: string,
): Promise<{ url: string } | { error: string }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (existing.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (existing.archived_at) {
    return { error: "Cette facture est archivée." };
  }

  const status = toInvoiceStatus(existing.status);
  if (!canCopyInvoicePublicLink(status)) {
    return { error: "Cette facture n'a pas de lien public partageable." };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, invoiceId, user.id);
  if (!urlResult.ok) {
    return { error: urlResult.error };
  }

  return { url: urlResult.url };
}

export async function deleteDraftInvoiceAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }
  if (existing.status !== "draft") {
    return { error: "Seuls les brouillons peuvent être supprimés." };
  }

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect("/invoices");
}

export async function archiveInvoiceAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (!canArchiveInvoice(toInvoiceStatus(existing.status), existing.archived_at)) {
    return {
      error:
        existing.status === "draft"
          ? "Les brouillons se suppriment définitivement."
          : "Cette facture est déjà archivée.",
    };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

export async function restoreInvoiceAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getInvoiceById(supabase, invoiceId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (!canRestoreInvoice(existing.archived_at)) {
    return { error: "Cette facture n'est pas archivée." };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ archived_at: null })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

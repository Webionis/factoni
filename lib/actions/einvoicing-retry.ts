"use server";

import { revalidatePath } from "next/cache";

import { type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getInvoiceById } from "@/lib/data/invoices";
import { autoTransmitInvoiceOnSend } from "@/lib/e-invoicing/auto-transmit-on-send";

export async function retryInvoiceEinvoicingTransmissionAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) {
    return { error: auth.error };
  }

  const invoice = await getInvoiceById(auth.supabase, invoiceId);
  if (!invoice || invoice.user_id !== auth.user.id) {
    return { error: "Facture introuvable." };
  }

  if (invoice.status !== "sent" && invoice.status !== "overdue") {
    return {
      error: "Seules les factures envoyées peuvent être transmises.",
    };
  }

  const result = await autoTransmitInvoiceOnSend({
    supabase: auth.supabase,
    userId: auth.user.id,
    invoiceId,
  });

  revalidatePath(`/invoices/${invoiceId}`);

  if (result.status === "failed") {
    return { error: result.error };
  }

  if (result.status === "success") {
    return {
      success: true,
      successDetail: "Facture transmise à la Plateforme Agréée.",
    };
  }

  if (result.status === "already_transmitted") {
    return {
      success: true,
      successDetail: "Cette facture a déjà été transmise.",
    };
  }

  return {
    success: true,
    warning: result.reason,
  };
}

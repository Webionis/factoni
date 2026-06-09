"use server";

import { revalidatePath } from "next/cache";

import { type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getProfile } from "@/lib/auth/profile";
import { getInvoiceOnlyById } from "@/lib/data/invoices";
import { canSendInvoiceReminder } from "@/lib/invoices/reminder-eligibility";
import { sendInvoiceReminder } from "@/lib/invoices/reminders";

export async function sendManualInvoiceReminderAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const invoice = await getInvoiceOnlyById(supabase, invoiceId);
  if (!invoice || invoice.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (!canSendInvoiceReminder(invoice)) {
    return {
      error:
        "Cette facture ne peut pas être relancée (brouillon, payée, annulée ou archivée).",
    };
  }

  const profile = await getProfile(supabase, user.id);
  const sentByName = profile?.full_name?.trim() || null;

  const { data: company } = await supabase
    .from("companies")
    .select(
      "auto_reminders_enabled, auto_reminder_day_3, auto_reminder_day_7, auto_reminder_day_14, reminder_email_subject, reminder_email_message, trade_name, email",
    )
    .eq("id", invoice.company_id)
    .maybeSingle();

  if (!company) {
    return { error: "Entreprise introuvable." };
  }

  const result = await sendInvoiceReminder(supabase, invoiceId, "manual", {
    sentByName,
    ownerEmail: company.email,
    ownerName: sentByName,
    company,
  });

  if (!result.success) {
    if (result.skipped === "email_failed" || result.skipped?.includes("email")) {
      return {
        error:
          "L'email n'a pas pu être envoyé. Vérifiez la configuration Resend.",
      };
    }
    return { error: result.skipped ?? "Impossible d'envoyer la relance." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true };
}

export async function toggleInvoiceAutoRemindersAction(
  invoiceId: string,
  disabled: boolean,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("invoices")
    .update({ auto_reminders_disabled: disabled })
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .eq("document_type", "invoice");

  if (error) {
    return { error: "Impossible de mettre à jour les relances automatiques." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

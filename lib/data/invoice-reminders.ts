import type { SupabaseClient } from "@supabase/supabase-js";

import type { InvoiceReminderType } from "@/lib/invoices/reminder-types";
import { logServerError } from "@/lib/logger";
import type { Database } from "@/types/database";

export type InvoiceReminderRow =
  Database["public"]["Tables"]["invoice_reminders"]["Row"];

export async function listInvoiceReminders(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
): Promise<InvoiceReminderRow[]> {
  const { data, error } = await supabase
    .from("invoice_reminders")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    logServerError("listInvoiceReminders", error, { invoiceId });
    return [];
  }

  return data ?? [];
}

export async function countInvoiceReminders(
  supabase: SupabaseClient<Database>,
  invoiceId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("invoice_reminders")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoiceId)
    .eq("status", "sent");

  if (error) {
    logServerError("countInvoiceReminders", error, { invoiceId });
    return 0;
  }

  return count ?? 0;
}

export async function hasReminderBeenSent(
  client: SupabaseClient<Database>,
  invoiceId: string,
  reminderType: InvoiceReminderType,
): Promise<boolean> {
  const { data, error } = await client
    .from("invoice_reminders")
    .select("id")
    .eq("invoice_id", invoiceId)
    .eq("reminder_type", reminderType)
    .eq("status", "sent")
    .maybeSingle();

  if (error) {
    logServerError("hasReminderBeenSent", error, { invoiceId, reminderType });
    return false;
  }

  return Boolean(data);
}

export async function getSentAutoReminderTypes(
  client: SupabaseClient<Database>,
  invoiceId: string,
): Promise<Set<string>> {
  const { data, error } = await client
    .from("invoice_reminders")
    .select("reminder_type")
    .eq("invoice_id", invoiceId)
    .eq("status", "sent")
    .in("reminder_type", ["auto_3", "auto_7", "auto_14"]);

  if (error) {
    logServerError("getSentAutoReminderTypes", error, { invoiceId });
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.reminder_type));
}

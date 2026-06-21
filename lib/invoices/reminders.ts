import type { SupabaseClient } from "@supabase/supabase-js";

import type { CompanyRow } from "@/lib/auth/profile";
import { filterUserIdsWithFeature } from "@/lib/billing/feature-guard";
import {
  getSentAutoReminderTypes,
  hasReminderBeenSent,
} from "@/lib/data/invoice-reminders";
import type { InvoiceDetail } from "@/lib/data/invoices";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
  getInvoiceOnlyById,
} from "@/lib/data/invoices";
import { ensureClientPortalUrl } from "@/lib/client-portal/tokens";
import { ensurePublicDocumentUrl } from "@/lib/data/public-documents";
import {
  sendInvoiceReminderClientEmail,
  sendInvoiceReminderOwnerEmail,
} from "@/lib/email/send-invoice-reminder-emails";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import { addDaysToIsoDate } from "@/lib/dates/invoice-dates";
import { todayIsoDate, isPastDueDate } from "@/lib/invoices/overdue";
import {
  buildReminderTemplateVariables,
  resolveReminderEmailContent,
} from "@/lib/invoices/reminder-template-vars";
import { canSendInvoiceReminder } from "@/lib/invoices/reminder-eligibility";
import {
  AUTO_REMINDER_TIERS,
  type AutoInvoiceReminderType,
  type InvoiceReminderType,
} from "@/lib/invoices/reminder-types";
import { invoiceDisplayNumber } from "@/lib/invoices/status";
import { logServerError } from "@/lib/logger";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInvoiceReminderSentNotification } from "@/lib/data/notifications";
import type { Database } from "@/types/database";

type AdminClient = ReturnType<typeof createAdminClient>;
type DbClient = SupabaseClient<Database> | AdminClient;

export type CompanyReminderSettings = Pick<
  CompanyRow,
  | "auto_reminders_enabled"
  | "auto_reminder_day_3"
  | "auto_reminder_day_7"
  | "auto_reminder_day_14"
  | "reminder_email_subject"
  | "reminder_email_message"
  | "trade_name"
  | "email"
>;

export type InvoiceReminderCandidate = {
  invoice: InvoiceDetail;
  company: CompanyReminderSettings;
};

export type SendInvoiceReminderResult = {
  success: boolean;
  skipped?: string;
  reminderId?: string;
  notificationCreated?: boolean;
  emailSent?: boolean;
};

export { hasReminderBeenSent };

/** Jours calendaires écoulés depuis la date d'échéance (échéance = jour 0). */
export function daysAfterDueDate(
  dueDate: string,
  reference = new Date(),
): number {
  const today = todayIsoDate(reference);
  if (dueDate >= today) return 0;
  const due = new Date(`${dueDate}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  return Math.floor((now.getTime() - due.getTime()) / 86_400_000);
}

export function isInvoiceEligibleForAutoReminders(invoice: {
  status: Database["public"]["Enums"]["invoice_status"];
  archived_at: string | null;
  auto_reminders_disabled: boolean;
  document_type: Database["public"]["Enums"]["document_type"];
  due_date: string;
}): boolean {
  if (!canSendInvoiceReminder(invoice)) return false;
  if (invoice.auto_reminders_disabled) return false;
  return isPastDueDate(invoice.due_date);
}

export function isAutoTierEnabled(
  company: CompanyReminderSettings,
  type: AutoInvoiceReminderType,
): boolean {
  if (!company.auto_reminders_enabled) return false;
  if (type === "auto_3") return company.auto_reminder_day_3;
  if (type === "auto_7") return company.auto_reminder_day_7;
  return company.auto_reminder_day_14;
}

/** Prochaine relance auto à envoyer (la plus basse non encore envoyée et due). */
export function resolveNextAutoReminderType(
  daysOverdue: number,
  company: CompanyReminderSettings,
  sentTypes: Set<string>,
): AutoInvoiceReminderType | null {
  if (!company.auto_reminders_enabled) return null;

  for (const tier of AUTO_REMINDER_TIERS) {
    if (!isAutoTierEnabled(company, tier.type)) continue;
    if (sentTypes.has(tier.type)) continue;
    if (daysOverdue >= tier.daysAfterDue) {
      return tier.type;
    }
  }

  return null;
}

/** Date estimée de la prochaine relance auto (pour affichage UI). */
export function computeNextAutoReminderDate(
  dueDate: string,
  company: CompanyReminderSettings,
  sentTypes: Set<string>,
  reference = new Date(),
): { type: AutoInvoiceReminderType; date: string } | null {
  if (!company.auto_reminders_enabled) return null;

  for (const tier of AUTO_REMINDER_TIERS) {
    if (!isAutoTierEnabled(company, tier.type)) continue;
    if (sentTypes.has(tier.type)) continue;

    const targetIso = addDaysToIsoDate(dueDate, tier.daysAfterDue);
    if (!targetIso) continue;

    if (targetIso <= todayIsoDate(reference)) {
      return { type: tier.type, date: todayIsoDate(reference) };
    }

    return { type: tier.type, date: targetIso };
  }

  return null;
}

export async function getInvoicesNeedingReminders(
  client: DbClient,
  reference = new Date(),
): Promise<InvoiceReminderCandidate[]> {
  const today = todayIsoDate(reference);

  const { data: invoices, error } = await client
    .from("invoices")
    .select(
      `
      *,
      invoice_lines (*),
      clients (id, name, company_name, client_type, email)
    `,
    )
    .eq("document_type", "invoice")
    .in("status", ["sent", "overdue"])
    .is("archived_at", null)
    .eq("auto_reminders_disabled", false)
    .lt("due_date", today);

  if (error) {
    logServerError("getInvoicesNeedingReminders", error);
    return [];
  }

  if (!invoices?.length) return [];

  const companyIds = [...new Set(invoices.map((row) => row.company_id))];
  const { data: companies, error: companiesError } = await client
    .from("companies")
    .select(
      "id, auto_reminders_enabled, auto_reminder_day_3, auto_reminder_day_7, auto_reminder_day_14, reminder_email_subject, reminder_email_message, trade_name, email",
    )
    .in("id", companyIds)
    .eq("auto_reminders_enabled", true);

  if (companiesError) {
    logServerError("getInvoicesNeedingReminders.companies", companiesError);
    return [];
  }

  const companyById = new Map(
    (companies ?? []).map((company) => [company.id, company as CompanyReminderSettings & { id: string }]),
  );

  const userIdsWithAutoReminders = await filterUserIdsWithFeature(
    client,
    invoices.map((invoice) => invoice.user_id),
    "automaticReminders",
  );

  const candidates: InvoiceReminderCandidate[] = [];

  for (const invoice of invoices) {
    if (!userIdsWithAutoReminders.has(invoice.user_id)) continue;

    const company = companyById.get(invoice.company_id);
    if (!company) continue;

    const clientEmail = getInvoiceClientEmail(
      (invoice as InvoiceDetail).clients ?? null,
      invoice.client_snapshot,
    );
    if (!clientEmail) continue;

    const sentTypes = await getSentAutoReminderTypes(client, invoice.id);
    const daysOverdue = daysAfterDueDate(invoice.due_date, reference);
    const nextType = resolveNextAutoReminderType(
      daysOverdue,
      company,
      sentTypes,
    );

    if (!nextType) continue;

    candidates.push({
      invoice: invoice as InvoiceDetail,
      company,
    });
  }

  return candidates;
}

async function resolveReminderContext(
  client: DbClient,
  invoice: InvoiceDetail,
  company: CompanyReminderSettings,
): Promise<
  | { error: string }
  | {
      recipientEmail: string;
      clientName: string;
      companyName: string;
      invoiceNumber: string;
      publicDocumentUrl: string;
      clientPortalUrl: string | null;
      subject: string;
      message: string;
    }
> {
  const recipientEmail = getInvoiceClientEmail(
    invoice.clients ?? null,
    invoice.client_snapshot,
  );
  if (!recipientEmail) {
    return { error: "Aucune adresse email client." };
  }

  const publicUrlResult = await ensurePublicDocumentUrl(
    client,
    invoice.id,
    invoice.user_id,
  );
  if (!publicUrlResult.ok) {
    return { error: publicUrlResult.error };
  }

  const clientName =
    clientNameFromSnapshot(invoice.client_snapshot) ??
    clientNameFromInvoice(invoice);
  const snapshotCompany = parseCompanySnapshot(invoice.company_snapshot);
  const companyName = snapshotCompany?.party.name ?? company.trade_name;
  const invoiceNumber = invoiceDisplayNumber(
    invoice.invoice_number,
    invoice.id,
  );

  const portalResult = invoice.client_id
    ? await ensureClientPortalUrl(client, invoice.client_id, invoice.user_id)
    : null;

  const variables = buildReminderTemplateVariables({
    clientName,
    invoiceNumber,
    totalTtc: Number(invoice.total_ttc),
    dueDate: invoice.due_date,
    invoiceLink: publicUrlResult.url,
    portalLink: portalResult?.ok ? portalResult.url : "",
    companyName,
  });

  const { subject, message } = resolveReminderEmailContent({
    customSubject: company.reminder_email_subject,
    customMessage: company.reminder_email_message,
    variables,
  });

  return {
    recipientEmail,
    clientName,
    companyName,
    invoiceNumber,
    publicDocumentUrl: publicUrlResult.url,
    clientPortalUrl: portalResult?.ok ? portalResult.url : null,
    subject,
    message,
  };
}

export async function sendInvoiceReminder(
  client: DbClient,
  invoiceId: string,
  reminderType: InvoiceReminderType,
  options?: {
    sentByName?: string | null;
    ownerEmail?: string | null;
    ownerName?: string | null;
    company?: CompanyReminderSettings;
  },
): Promise<SendInvoiceReminderResult> {
  const invoice = await getInvoiceOnlyById(client, invoiceId);
  if (!invoice) {
    return { success: false, skipped: "invoice_not_found" };
  }

  if (!canSendInvoiceReminder(invoice)) {
    return { success: false, skipped: "not_eligible" };
  }

  if (reminderType !== "manual") {
    const alreadySent = await hasReminderBeenSent(
      client,
      invoiceId,
      reminderType,
    );
    if (alreadySent) {
      return { success: false, skipped: "already_sent" };
    }
  }

  let company = options?.company;
  if (!company) {
    const { data: companyRow } = await client
      .from("companies")
      .select(
        "auto_reminders_enabled, auto_reminder_day_3, auto_reminder_day_7, auto_reminder_day_14, reminder_email_subject, reminder_email_message, trade_name, email",
      )
      .eq("id", invoice.company_id)
      .maybeSingle();

    if (!companyRow) {
      return { success: false, skipped: "company_not_found" };
    }
    company = companyRow;
  }

  const ctx = await resolveReminderContext(client, invoice, company);
  if ("error" in ctx) {
    return { success: false, skipped: ctx.error };
  }

  const emailResult = await sendInvoiceReminderClientEmail({
    subject: ctx.subject,
    invoiceId,
    clientEmail: ctx.recipientEmail,
    clientName: ctx.clientName,
    companyName: ctx.companyName,
    invoiceNumber: ctx.invoiceNumber,
    totalTtc: Number(invoice.total_ttc),
    dueDate: invoice.due_date,
    publicDocumentUrl: ctx.publicDocumentUrl,
    clientPortalUrl: ctx.clientPortalUrl,
    messageBody: ctx.message,
  });

  if (!emailResult.ok) {
    const admin = createAdminClient();
    await admin.from("invoice_reminders").insert({
      invoice_id: invoiceId,
      user_id: invoice.user_id,
      recipient_email: ctx.recipientEmail,
      subject: ctx.subject,
      message: ctx.message,
      reminder_type: reminderType,
      sent_by_name: options?.sentByName ?? null,
      status: "failed",
      template_id: "unpaid_invoice",
    });
    return { success: false, skipped: emailResult.error ?? "email_failed" };
  }

  const admin = createAdminClient();
  const { data: reminderRow, error: insertError } = await admin
    .from("invoice_reminders")
    .insert({
      invoice_id: invoiceId,
      user_id: invoice.user_id,
      recipient_email: ctx.recipientEmail,
      subject: ctx.subject,
      message: ctx.message,
      reminder_type: reminderType,
      sent_by_name: options?.sentByName ?? null,
      status: "sent",
      provider_message_id: emailResult.providerMessageId,
      template_id: "unpaid_invoice",
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505" && reminderType !== "manual") {
      return { success: false, skipped: "duplicate_race" };
    }
    logServerError("sendInvoiceReminder.insert", insertError, {
      invoiceId,
      reminderType,
    });
    return { success: false, skipped: "history_insert_failed" };
  }

  const ownerEmail = options?.ownerEmail ?? company.email;
  const notificationCreated = await createInvoiceReminderSentNotification({
    ownerUserId: invoice.user_id,
    invoiceId,
    invoiceNumber: ctx.invoiceNumber,
    clientName: ctx.clientName,
    amountTtc: Number(invoice.total_ttc),
    reminderType,
    reminderId: reminderRow.id,
    sentByName: options?.sentByName ?? null,
  });

  if (reminderType !== "manual" && ownerEmail) {
    await sendInvoiceReminderOwnerEmail({
      ownerEmail,
      invoiceId,
      invoiceNumber: ctx.invoiceNumber,
      clientName: ctx.clientName,
      reminderType,
      ownerName: options?.ownerName,
    });
  }

  return {
    success: true,
    reminderId: reminderRow.id,
    notificationCreated,
    emailSent: true,
  };
}

export async function sendAutomaticInvoiceReminder(
  candidate: InvoiceReminderCandidate,
  reference = new Date(),
): Promise<SendInvoiceReminderResult> {
  const { invoice, company } = candidate;

  const fresh = await getInvoiceOnlyById(createAdminClient(), invoice.id);
  if (!fresh || !isInvoiceEligibleForAutoReminders(fresh)) {
    return { success: false, skipped: "no_longer_eligible" };
  }

  const sentTypes = await getSentAutoReminderTypes(
    createAdminClient(),
    invoice.id,
  );
  const daysOverdue = daysAfterDueDate(invoice.due_date, reference);
  const reminderType = resolveNextAutoReminderType(
    daysOverdue,
    company,
    sentTypes,
  );

  if (!reminderType) {
    return { success: false, skipped: "no_reminder_due" };
  }

  return sendInvoiceReminder(createAdminClient(), invoice.id, reminderType, {
    company,
    ownerEmail: company.email,
  });
}

/** Les factures payées ne sont plus relancées (vérifié via canSendInvoiceReminder). */
export function stopRemindersForPaidInvoice(): void {
  /* Pas d'état à nettoyer : l'éligibilité bloque les envois futurs. */
}

export type ProcessAutoRemindersResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

export async function processAutomaticInvoiceReminders(
  reference = new Date(),
): Promise<ProcessAutoRemindersResult> {
  const admin = createAdminClient();
  const candidates = await getInvoicesNeedingReminders(admin, reference);

  const result: ProcessAutoRemindersResult = {
    processed: candidates.length,
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  for (const candidate of candidates) {
    const sendResult = await sendAutomaticInvoiceReminder(candidate, reference);
    if (sendResult.success) {
      result.sent += 1;
    } else if (
      sendResult.skipped === "already_sent" ||
      sendResult.skipped === "duplicate_race" ||
      sendResult.skipped === "no_longer_eligible" ||
      sendResult.skipped === "no_reminder_due"
    ) {
      result.skipped += 1;
    } else {
      result.errors += 1;
    }
  }

  return result;
}

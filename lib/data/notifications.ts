import type { SupabaseClient } from "@supabase/supabase-js";

import { formatCurrency } from "@/lib/invoices/calculate";
import { logServerError } from "@/lib/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

export type NotificationType =
  | "quote_signed"
  | "invoice_paid"
  | "quote_deposit_requested"
  | "quote_deposit_paid"
  | "invoice_reminder_sent";

export type QuoteSignedNotificationData = {
  quote_id: string;
  quote_number: string;
  client_name: string;
  amount_ttc: number;
  signed_at: string;
  owner_user_id: string;
};

export type InvoicePaidNotificationData = {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  amount_ttc: number;
  paid_at: string;
  owner_user_id: string;
};

export type QuoteDepositNotificationData = {
  quote_id: string;
  quote_number: string;
  client_name: string;
  deposit_amount: number;
  owner_user_id: string;
  paid_at?: string;
};

export type InvoiceReminderSentNotificationData = {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  amount_ttc: number;
  reminder_type: string;
  reminder_id: string;
  sent_by_name: string | null;
  owner_user_id: string;
};

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type DashboardNotification =
  | {
      id: string;
      type: "quote_signed";
      title: string;
      message: string;
      data: QuoteSignedNotificationData;
      readAt: string | null;
      createdAt: string;
      href: string;
      isUnread: boolean;
    }
  | {
      id: string;
      type: "invoice_paid";
      title: string;
      message: string;
      data: InvoicePaidNotificationData;
      readAt: string | null;
      createdAt: string;
      href: string;
      isUnread: boolean;
    }
  | {
      id: string;
      type: "quote_deposit_requested";
      title: string;
      message: string;
      data: QuoteDepositNotificationData;
      readAt: string | null;
      createdAt: string;
      href: string;
      isUnread: boolean;
    }
  | {
      id: string;
      type: "quote_deposit_paid";
      title: string;
      message: string;
      data: QuoteDepositNotificationData;
      readAt: string | null;
      createdAt: string;
      href: string;
      isUnread: boolean;
    }
  | {
      id: string;
      type: "invoice_reminder_sent";
      title: string;
      message: string;
      data: InvoiceReminderSentNotificationData;
      readAt: string | null;
      createdAt: string;
      href: string;
      isUnread: boolean;
    };

export const ACTIVITY_INITIAL_VISIBLE_MOBILE = 2;
export const ACTIVITY_INITIAL_VISIBLE_DESKTOP = 4;
export const ACTIVITY_FETCH_LIMIT = 50;

const NOTIFICATION_TYPES: NotificationType[] = [
  "quote_signed",
  "invoice_paid",
  "quote_deposit_requested",
  "quote_deposit_paid",
  "invoice_reminder_sent",
];

function parseQuoteSignedData(data: Json): QuoteSignedNotificationData | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, Json | undefined>;
  const quoteId = record.quote_id;
  const quoteNumber = record.quote_number;
  const clientName = record.client_name;
  const amountTtc = record.amount_ttc;
  const signedAt = record.signed_at;
  const ownerUserId = record.owner_user_id;

  if (
    typeof quoteId !== "string" ||
    typeof quoteNumber !== "string" ||
    typeof clientName !== "string" ||
    typeof signedAt !== "string" ||
    typeof ownerUserId !== "string" ||
    typeof amountTtc !== "number"
  ) {
    return null;
  }

  return {
    quote_id: quoteId,
    quote_number: quoteNumber,
    client_name: clientName,
    amount_ttc: amountTtc,
    signed_at: signedAt,
    owner_user_id: ownerUserId,
  };
}

function parseInvoicePaidData(data: Json): InvoicePaidNotificationData | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, Json | undefined>;
  const invoiceId = record.invoice_id;
  const invoiceNumber = record.invoice_number;
  const clientName = record.client_name;
  const amountTtc = record.amount_ttc;
  const paidAt = record.paid_at;
  const ownerUserId = record.owner_user_id;

  const amount =
    typeof amountTtc === "number"
      ? amountTtc
      : typeof amountTtc === "string"
        ? Number(amountTtc)
        : NaN;

  if (
    typeof invoiceId !== "string" ||
    typeof invoiceNumber !== "string" ||
    typeof clientName !== "string" ||
    typeof paidAt !== "string" ||
    typeof ownerUserId !== "string" ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  return {
    invoice_id: invoiceId,
    invoice_number: invoiceNumber,
    client_name: clientName,
    amount_ttc: amount,
    paid_at: paidAt,
    owner_user_id: ownerUserId,
  };
}

function parseQuoteDepositData(
  data: Json,
  requirePaidAt: boolean,
): QuoteDepositNotificationData | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, Json | undefined>;
  const quoteId = record.quote_id;
  const quoteNumber = record.quote_number;
  const clientName = record.client_name;
  const depositAmount = record.deposit_amount;
  const ownerUserId = record.owner_user_id;
  const paidAt = record.paid_at;

  const amount =
    typeof depositAmount === "number"
      ? depositAmount
      : typeof depositAmount === "string"
        ? Number(depositAmount)
        : NaN;

  if (
    typeof quoteId !== "string" ||
    typeof quoteNumber !== "string" ||
    typeof clientName !== "string" ||
    typeof ownerUserId !== "string" ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  if (requirePaidAt && typeof paidAt !== "string") {
    return null;
  }

  return {
    quote_id: quoteId,
    quote_number: quoteNumber,
    client_name: clientName,
    deposit_amount: amount,
    owner_user_id: ownerUserId,
    paid_at: typeof paidAt === "string" ? paidAt : undefined,
  };
}

function toDashboardNotification(row: NotificationRow): DashboardNotification | null {
  if (row.type === "quote_signed") {
    const data = parseQuoteSignedData(row.data);
    if (!data) return null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data,
      readAt: row.read_at,
      createdAt: row.created_at,
      href: `/quotes/${data.quote_id}`,
      isUnread: row.read_at === null,
    };
  }

  if (row.type === "invoice_paid") {
    const data = parseInvoicePaidData(row.data);
    if (!data) return null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data,
      readAt: row.read_at,
      createdAt: row.created_at,
      href: `/invoices/${data.invoice_id}`,
      isUnread: row.read_at === null,
    };
  }

  if (row.type === "quote_deposit_requested") {
    const data = parseQuoteDepositData(row.data, false);
    if (!data) return null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data,
      readAt: row.read_at,
      createdAt: row.created_at,
      href: `/quotes/${data.quote_id}`,
      isUnread: row.read_at === null,
    };
  }

  if (row.type === "quote_deposit_paid") {
    const data = parseQuoteDepositData(row.data, true);
    if (!data) return null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data,
      readAt: row.read_at,
      createdAt: row.created_at,
      href: `/quotes/${data.quote_id}`,
      isUnread: row.read_at === null,
    };
  }

  if (row.type === "invoice_reminder_sent") {
    const data = parseInvoiceReminderSentData(row.data);
    if (!data) return null;

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data,
      readAt: row.read_at,
      createdAt: row.created_at,
      href: `/invoices/${data.invoice_id}`,
      isUnread: row.read_at === null,
    };
  }

  return null;
}

function parseInvoiceReminderSentData(
  data: Json,
): InvoiceReminderSentNotificationData | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, Json | undefined>;
  const invoiceId = record.invoice_id;
  const invoiceNumber = record.invoice_number;
  const clientName = record.client_name;
  const amountTtc = record.amount_ttc;
  const reminderType = record.reminder_type;
  const reminderId = record.reminder_id;
  const sentByName = record.sent_by_name;
  const ownerUserId = record.owner_user_id;

  const amount =
    typeof amountTtc === "number"
      ? amountTtc
      : typeof amountTtc === "string"
        ? Number(amountTtc)
        : NaN;

  if (
    typeof invoiceId !== "string" ||
    typeof invoiceNumber !== "string" ||
    typeof clientName !== "string" ||
    typeof reminderType !== "string" ||
    typeof reminderId !== "string" ||
    typeof ownerUserId !== "string" ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  return {
    invoice_id: invoiceId,
    invoice_number: invoiceNumber,
    client_name: clientName,
    amount_ttc: amount,
    reminder_type: reminderType,
    reminder_id: reminderId,
    sent_by_name:
      typeof sentByName === "string" ? sentByName : sentByName === null ? null : null,
    owner_user_id: ownerUserId,
  };
}

export async function countNotificationsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("type", NOTIFICATION_TYPES);

  if (error) {
    logServerError("countNotificationsForUser", error, { userId });
    return 0;
  }

  return count ?? 0;
}

export async function listNotificationsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = ACTIVITY_FETCH_LIMIT,
): Promise<DashboardNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .in("type", NOTIFICATION_TYPES)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logServerError("listNotificationsForUser", error, { userId });
    return [];
  }

  return (data ?? [])
    .map(toDashboardNotification)
    .filter((item): item is DashboardNotification => item !== null);
}

export async function getUnreadNotificationsCount(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("type", NOTIFICATION_TYPES)
    .is("read_at", null);

  if (error) {
    logServerError("getUnreadNotificationsCount", error, { userId });
    return 0;
  }

  return count ?? 0;
}

/** @deprecated Utiliser getUnreadNotificationsCount */
export const countUnreadNotifications = getUnreadNotificationsCount;

export async function markAllNotificationsAsRead(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    logServerError("markAllNotificationsAsRead", error, { userId });
    return false;
  }

  return true;
}

export async function markNotificationAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string,
  userId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    logServerError("markNotificationAsRead", error, { notificationId, userId });
    return false;
  }

  return true;
}

export interface CreateQuoteSignedNotificationParams {
  ownerUserId: string;
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  amountTtc: number;
  signedAt: string;
}

/**
 * Crée une notification in-app après signature réussie.
 * Utilise le client admin (workflow public) ; n'interrompt jamais la signature.
 */
export async function createQuoteSignedNotification(
  params: CreateQuoteSignedNotificationParams,
): Promise<void> {
  if (!isAdminClientConfigured()) {
    logServerError("createQuoteSignedNotification", "admin_client_missing", {
      quoteId: params.quoteId,
    });
    return;
  }

  const admin = createAdminClient();
  const amountLabel = `${formatCurrency(params.amountTtc)} TTC`;
  const message = `Le client ${params.clientName} a signé le devis ${params.quoteNumber} (${amountLabel})`;

  const data: QuoteSignedNotificationData = {
    quote_id: params.quoteId,
    quote_number: params.quoteNumber,
    client_name: params.clientName,
    amount_ttc: params.amountTtc,
    signed_at: params.signedAt,
    owner_user_id: params.ownerUserId,
  };

  const { error } = await admin.from("notifications").insert({
    user_id: params.ownerUserId,
    type: "quote_signed",
    title: "Devis signé",
    message,
    data,
  });

  if (error) {
    if (error.code === "23505") {
      return;
    }
    logServerError("createQuoteSignedNotification", error, {
      quoteId: params.quoteId,
      userId: params.ownerUserId,
    });
  }
}

export interface CreateInvoicePaidNotificationParams {
  ownerUserId: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amountTtc: number;
  paidAt: string;
}

export async function hasInvoicePaidNotification(
  supabase: SupabaseClient<Database>,
  userId: string,
  invoiceId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "invoice_paid")
    .eq("data->>invoice_id", invoiceId)
    .maybeSingle();

  if (error) {
    logServerError("hasInvoicePaidNotification", error, { userId, invoiceId });
    return false;
  }

  return Boolean(data);
}

/** @returns true si une nouvelle notification a été créée */
export async function createInvoicePaidNotification(
  params: CreateInvoicePaidNotificationParams,
): Promise<boolean> {
  if (!isAdminClientConfigured()) {
    logServerError("createInvoicePaidNotification", "admin_client_missing", {
      invoiceId: params.invoiceId,
    });
    return false;
  }

  const admin = createAdminClient();
  const amountLabel = `${formatCurrency(params.amountTtc)} TTC`;
  const message = `Le client ${params.clientName} a payé la facture ${params.invoiceNumber} (${amountLabel})`;

  const data: InvoicePaidNotificationData = {
    invoice_id: params.invoiceId,
    invoice_number: params.invoiceNumber,
    client_name: params.clientName,
    amount_ttc: params.amountTtc,
    paid_at: params.paidAt,
    owner_user_id: params.ownerUserId,
  };

  const { error } = await admin.from("notifications").insert({
    user_id: params.ownerUserId,
    type: "invoice_paid",
    title: "Facture payée 🎉",
    message,
    data,
  });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    logServerError("createInvoicePaidNotification", error, {
      invoiceId: params.invoiceId,
      userId: params.ownerUserId,
    });
    return false;
  }

  return true;
}

export interface CreateQuoteDepositRequestedNotificationParams {
  ownerUserId: string;
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  depositAmount: number;
}

export async function createQuoteDepositRequestedNotification(
  params: CreateQuoteDepositRequestedNotificationParams,
): Promise<boolean> {
  if (!isAdminClientConfigured()) return false;

  const admin = createAdminClient();
  const amountLabel = formatCurrency(params.depositAmount);
  const message = `Un acompte de ${amountLabel} a été demandé pour le devis ${params.quoteNumber}`;

  const data: QuoteDepositNotificationData = {
    quote_id: params.quoteId,
    quote_number: params.quoteNumber,
    client_name: params.clientName,
    deposit_amount: params.depositAmount,
    owner_user_id: params.ownerUserId,
  };

  const { error } = await admin.from("notifications").insert({
    user_id: params.ownerUserId,
    type: "quote_deposit_requested",
    title: "Acompte demandé",
    message,
    data,
  });

  if (error) {
    if (error.code === "23505") return false;
    logServerError("createQuoteDepositRequestedNotification", error, {
      quoteId: params.quoteId,
    });
    return false;
  }

  return true;
}

export interface CreateQuoteDepositPaidNotificationParams {
  ownerUserId: string;
  quoteId: string;
  quoteNumber: string;
  clientName: string;
  depositAmount: number;
  paidAt: string;
}

export async function hasQuoteDepositPaidNotification(
  supabase: SupabaseClient<Database>,
  userId: string,
  quoteId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "quote_deposit_paid")
    .eq("data->>quote_id", quoteId)
    .maybeSingle();

  if (error) {
    logServerError("hasQuoteDepositPaidNotification", error, { userId, quoteId });
    return false;
  }

  return Boolean(data);
}

export async function createQuoteDepositPaidNotification(
  params: CreateQuoteDepositPaidNotificationParams,
): Promise<boolean> {
  if (!isAdminClientConfigured()) return false;

  const admin = createAdminClient();
  const amountLabel = formatCurrency(params.depositAmount);
  const message = `Le client ${params.clientName} a payé un acompte de ${amountLabel} pour le devis ${params.quoteNumber}`;

  const data: QuoteDepositNotificationData = {
    quote_id: params.quoteId,
    quote_number: params.quoteNumber,
    client_name: params.clientName,
    deposit_amount: params.depositAmount,
    owner_user_id: params.ownerUserId,
    paid_at: params.paidAt,
  };

  const { error } = await admin.from("notifications").insert({
    user_id: params.ownerUserId,
    type: "quote_deposit_paid",
    title: "Acompte reçu",
    message,
    data,
  });

  if (error) {
    if (error.code === "23505") return false;
    logServerError("createQuoteDepositPaidNotification", error, {
      quoteId: params.quoteId,
    });
    return false;
  }

  return true;
}

export interface CreateInvoiceReminderSentNotificationParams {
  ownerUserId: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amountTtc: number;
  reminderType: string;
  reminderId: string;
  sentByName?: string | null;
}

export async function createInvoiceReminderSentNotification(
  params: CreateInvoiceReminderSentNotificationParams,
): Promise<boolean> {
  if (!isAdminClientConfigured()) return false;

  const admin = createAdminClient();
  const isManual = params.reminderType === "manual";
  const title = isManual ? "Relance manuelle envoyée" : "Relance automatique envoyée";
  const message = isManual
    ? params.sentByName
      ? `Relance manuelle envoyée par ${params.sentByName} pour la facture ${params.invoiceNumber}`
      : `Relance manuelle envoyée pour la facture ${params.invoiceNumber}`
    : `Relance automatique envoyée pour la facture ${params.invoiceNumber}`;

  const data: InvoiceReminderSentNotificationData = {
    invoice_id: params.invoiceId,
    invoice_number: params.invoiceNumber,
    client_name: params.clientName,
    amount_ttc: params.amountTtc,
    reminder_type: params.reminderType,
    reminder_id: params.reminderId,
    sent_by_name: params.sentByName ?? null,
    owner_user_id: params.ownerUserId,
  };

  const { error } = await admin.from("notifications").insert({
    user_id: params.ownerUserId,
    type: "invoice_reminder_sent",
    title,
    message,
    data,
  });

  if (error) {
    logServerError("createInvoiceReminderSentNotification", error, {
      invoiceId: params.invoiceId,
      reminderId: params.reminderId,
    });
    return false;
  }

  return true;
}

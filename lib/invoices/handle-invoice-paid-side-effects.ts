import { getInvoiceById } from "@/lib/data/invoices";
import { hasInvoicePaidNotification } from "@/lib/data/notifications";
import { notifyOwnerInvoicePaid } from "@/lib/invoices/notify-owner-invoice-paid";
import { logInvoicePaid } from "@/lib/invoices/paid-transition-log";
import { toInvoiceStatus, type InvoiceStatus } from "@/lib/invoices/status";
import { logServerError } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

export interface HandleInvoicePaidSideEffectsContext {
  source: string;
  transitioned?: boolean;
  previousStatus?: InvoiceStatus;
  paidAt?: string;
}

/**
 * Effets secondaires idempotents après confirmation paiement facture.
 * Notification dashboard + email professionnel.
 */
export async function handleInvoicePaidSideEffects(
  invoiceId: string,
  context: HandleInvoicePaidSideEffectsContext,
): Promise<{ notificationCreated: boolean; emailSent: boolean }> {
  logInvoicePaid("ENTER", {
    invoiceId,
    source: context.source,
    transitioned: context.transitioned ?? false,
  });

  try {
    const admin = createAdminClient();
    const invoice = await getInvoiceById(admin, invoiceId);

    if (!invoice) {
      logInvoicePaid("invoice_not_found", { invoiceId, source: context.source });
      logInvoicePaid("EXIT", { invoiceId, source: context.source, ok: false });
      return { notificationCreated: false, emailSent: false };
    }

    const currentStatus = toInvoiceStatus(invoice.status);

    logInvoicePaid("invoice_loaded", {
      invoiceId,
      status: currentStatus,
      userId: invoice.user_id,
      documentType: invoice.document_type,
      source: context.source,
    });

    if (invoice.document_type !== "invoice") {
      logInvoicePaid("EXIT", {
        invoiceId,
        source: context.source,
        ok: false,
        reason: "not_invoice",
      });
      return { notificationCreated: false, emailSent: false };
    }

    if (currentStatus !== "paid") {
      logInvoicePaid("invoice_not_paid", {
        invoiceId,
        status: currentStatus,
        source: context.source,
      });
      logInvoicePaid("EXIT", { invoiceId, source: context.source, ok: false });
      return { notificationCreated: false, emailSent: false };
    }

    const previous = context.previousStatus
      ? toInvoiceStatus(context.previousStatus)
      : null;

    if (context.transitioned) {
      logInvoicePaid("transitioned", {
        invoiceId,
        previousStatus: previous,
        source: context.source,
      });
    } else {
      logInvoicePaid("recover_side_effects", {
        invoiceId,
        source: context.source,
      });
    }

    const paidAt =
      context.paidAt ?? invoice.paid_at ?? new Date().toISOString();

    logInvoicePaid("notification_check", {
      invoiceId,
      userId: invoice.user_id,
      source: context.source,
    });

    const alreadyNotified = await hasInvoicePaidNotification(
      admin,
      invoice.user_id,
      invoiceId,
    );

    if (alreadyNotified) {
      logInvoicePaid("skipped_already_notified", {
        invoiceId,
        source: context.source,
      });
      logInvoicePaid("EXIT", {
        invoiceId,
        source: context.source,
        ok: true,
        notificationCreated: false,
        emailSent: false,
      });
      return { notificationCreated: false, emailSent: false };
    }

    logInvoicePaid("notification_insert_attempt", {
      invoiceId,
      source: context.source,
    });

    const { notificationCreated, emailSent } = await notifyOwnerInvoicePaid({
      invoice,
      paidAt,
    });

    if (notificationCreated) {
      logInvoicePaid("notification_insert_success", {
        invoiceId,
        source: context.source,
      });
    } else {
      logInvoicePaid("notification_insert_skipped", {
        invoiceId,
        source: context.source,
      });
    }

    if (emailSent) {
      logInvoicePaid("email_send_success", { invoiceId, source: context.source });
    } else if (notificationCreated) {
      logInvoicePaid("email_send_skipped", { invoiceId, source: context.source });
    }

    logInvoicePaid("EXIT", {
      invoiceId,
      source: context.source,
      ok: true,
      notificationCreated,
      emailSent,
    });

    return { notificationCreated, emailSent };
  } catch (error) {
    logInvoicePaid("error", {
      invoiceId,
      source: context.source,
      error: error instanceof Error ? error.message : String(error),
    });
    logServerError("handleInvoicePaidSideEffects", error, {
      invoiceId,
      source: context.source,
    });
    logInvoicePaid("EXIT", { invoiceId, source: context.source, ok: false });
    return { notificationCreated: false, emailSent: false };
  }
}

/** @deprecated Utiliser handleInvoicePaidSideEffects */
export async function onInvoicePaid(
  invoiceId: string,
  context: {
    transitioned: boolean;
    previousStatus?: InvoiceStatus;
    paidAt?: string;
    source?: string;
  },
): Promise<void> {
  await handleInvoicePaidSideEffects(invoiceId, {
    source: context.source ?? "onInvoicePaid",
    transitioned: context.transitioned,
    previousStatus: context.previousStatus,
    paidAt: context.paidAt,
  });
}

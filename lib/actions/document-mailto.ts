"use server";

import { revalidatePath } from "next/cache";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getCompanyForUser } from "@/lib/auth/profile";
import { getClientById } from "@/lib/data/clients";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
  getInvoiceById,
} from "@/lib/data/invoices";
import { appendClientPortalLink } from "@/lib/client-portal/email-snippet";
import { ensureClientPortalUrl } from "@/lib/client-portal/tokens";
import { ensurePublicDocumentUrl } from "@/lib/data/public-documents";
import { logServerError } from "@/lib/logger";
import { getQuoteById } from "@/lib/data/quotes";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import {
  appendInvoiceReminderPublicLink,
  buildInvoiceMailtoDefaults,
} from "@/lib/invoices/email-message";
import { canSendInvoiceReminder } from "@/lib/invoices/reminder-eligibility";
import { buildClientSnapshot, buildCompanySnapshot } from "@/lib/invoices/snapshots";
import {
  invoiceDisplayNumber,
  normalizeInvoiceStatus,
} from "@/lib/invoices/status";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { buildQuoteSignatureMailtoDefaults } from "@/lib/quotes/email-message";
import { canRemindQuoteClient } from "@/lib/quotes/reminder-eligibility";
import {
  normalizeQuoteStatus,
  quoteDisplayNumber,
  type QuoteStatus,
} from "@/lib/quotes/status";
import {
  buildReminderFromTemplate,
  DEFAULT_REMINDER_TEMPLATE_ID,
  isReminderTemplateId,
  type ReminderTemplateContext,
  type ReminderTemplateId,
} from "@/lib/invoices/reminder-templates";

export async function ensureDocumentPublicUrlAction(
  documentId: string,
): Promise<{ error: string; code?: string } | { publicDocumentUrl: string }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;

  const invoice = await getInvoiceById(supabase, documentId);
  if (!invoice || invoice.user_id !== user.id) {
    return { error: "Document introuvable." };
  }

  const result = await ensurePublicDocumentUrl(supabase, documentId, user.id);

  if (!result.ok) {
    logServerError("ensureDocumentPublicUrlAction", result.error, {
      documentId,
      userId: user.id,
      code: result.code,
    });
    return { error: result.error, code: result.code };
  }

  return { publicDocumentUrl: result.url };
}

export async function prepareQuoteMailtoAction(
  quoteId: string,
): Promise<
  | { error: string; code?: string }
  | {
      subject: string;
      message: string;
      recipientEmail: string;
    }
> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;
  const quote = await getQuoteById(supabase, quoteId);
  if (!quote || quote.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (quote.archived_at) {
    return { error: "Ce devis est archivé." };
  }

  const lines = quote.invoice_lines ?? [];
  if (lines.length === 0) {
    return { error: "Le devis ne contient aucune ligne." };
  }

  const recipientEmail = getInvoiceClientEmail(
    quote.clients,
    quote.client_snapshot,
  );
  if (!recipientEmail) {
    return {
      error:
        "Aucune adresse email n'est renseignée pour ce client. Ajoutez-la sur la fiche client.",
    };
  }

  const status = quote.status as QuoteStatus;
  if (status !== "ready") {
    return {
      error:
        status === "draft"
          ? "Validez d'abord le brouillon avant d'envoyer le devis au client."
          : "Ce devis ne peut plus être envoyé par email.",
    };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, quoteId, user.id);
  if (!urlResult.ok) {
    logServerError("prepareQuoteMailtoAction", urlResult.error, {
      quoteId,
      userId: user.id,
      code: urlResult.code,
    });
    return {
      error: "Impossible de créer le lien de signature. Réessayez.",
      code: urlResult.code,
    };
  }

  const company = await getCompanyForUser(supabase, user.id);
  const companyFromSnapshot = parseCompanySnapshot(quote.company_snapshot);
  const companyName =
    companyFromSnapshot?.party.name ??
    company?.trade_name ??
    "Votre entreprise";
  const clientName =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);

  const portalResult = quote.client_id
    ? await ensureClientPortalUrl(supabase, quote.client_id, user.id)
    : null;

  const defaults = buildQuoteSignatureMailtoDefaults({
    clientName,
    companyName,
    quoteNumber: quoteDisplayNumber(quote.invoice_number, quote.id),
    totalTtc: Number(quote.total_ttc),
    publicDocumentUrl: urlResult.url,
    clientPortalUrl: portalResult?.ok ? portalResult.url : null,
  });

  return {
    subject: defaults.subject,
    message: defaults.message,
    recipientEmail,
  };
}

export type MarkQuoteSentOnMailtoResult = ActionResult & {
  transitioned?: boolean;
};

/** Passe un devis ready → sent au moment de l'ouverture mailto. */
export async function markQuoteSentOnMailtoAction(
  quoteId: string,
): Promise<MarkQuoteSentOnMailtoResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const quote = await getQuoteById(auth.supabase, quoteId);
  if (!quote || quote.user_id !== auth.user.id) {
    return { error: "Devis introuvable." };
  }

  const wasAlreadySent =
    quote.status === "sent" || quote.status === "viewed";

  const { sendQuoteAction } = await import("@/lib/actions/quotes");
  const result = await sendQuoteAction(quoteId);
  if (result.error) {
    return { error: result.error };
  }

  return { success: true, transitioned: !wasAlreadySent };
}

/** @deprecated Utiliser markQuoteSentOnMailtoAction */
export const markQuoteAsSentAction = markQuoteSentOnMailtoAction;

/** Prépare une relance client (sent / viewed) — ne modifie pas le statut. */
export async function prepareQuoteReminderMailtoAction(
  quoteId: string,
): Promise<
  | { error: string; code?: string }
  | {
      subject: string;
      message: string;
      recipientEmail: string;
      publicDocumentUrl: string;
    }
> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;
  const quote = await getQuoteById(supabase, quoteId);
  if (!quote || quote.user_id !== user.id) {
    return { error: "Devis introuvable." };
  }

  if (quote.archived_at) {
    return { error: "Ce devis est archivé." };
  }

  const lines = quote.invoice_lines ?? [];
  if (lines.length === 0) {
    return { error: "Le devis ne contient aucune ligne." };
  }

  const quoteStatus = normalizeQuoteStatus(quote.status);
  if (
    !canRemindQuoteClient(
      quoteStatus,
      quote.due_date,
      quote.converted_to_invoice_id,
      quote.archived_at,
    )
  ) {
    return { error: "Ce devis ne peut pas faire l'objet d'une relance." };
  }

  const recipientEmail = getInvoiceClientEmail(
    quote.clients,
    quote.client_snapshot,
  );
  if (!recipientEmail) {
    return {
      error:
        "Ajoutez une adresse email au client pour préparer la relance.",
      code: "missing_email",
    };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, quoteId, user.id);
  if (!urlResult.ok) {
    logServerError("prepareQuoteReminderMailtoAction", urlResult.error, {
      quoteId,
      userId: user.id,
      code: urlResult.code,
    });
    return {
      error: "Impossible de récupérer le lien du devis. Réessayez.",
      code: urlResult.code,
    };
  }

  const company = await getCompanyForUser(supabase, user.id);
  const companyFromSnapshot = parseCompanySnapshot(quote.company_snapshot);
  const companyName =
    companyFromSnapshot?.party.name ??
    company?.trade_name ??
    "Votre entreprise";
  const clientName =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);

  const reminderContext: ReminderTemplateContext = {
    clientName,
    companyName,
    invoiceNumber: quoteDisplayNumber(quote.invoice_number, quote.id),
    totalTtc: Number(quote.total_ttc),
    issueDate: quote.issue_date,
    dueDate: quote.due_date,
  };

  const { subject, message } = buildReminderFromTemplate(
    "quote_validation_reminder",
    reminderContext,
  );

  const portalResult = quote.client_id
    ? await ensureClientPortalUrl(supabase, quote.client_id, user.id)
    : null;

  const messageWithLink = appendClientPortalLink(
    `${message.trim()}

Vous pouvez consulter et signer le devis en ligne via le lien sécurisé ci-dessous :

${urlResult.url.trim()}`,
    portalResult?.ok ? portalResult.url : null,
  );

  return {
    subject,
    message: messageWithLink,
    recipientEmail,
    publicDocumentUrl: urlResult.url,
  };
}

/** @deprecated Utiliser prepareQuoteReminderMailtoAction */
export async function prepareQuoteSignatureMailtoAction(
  quoteId: string,
): Promise<
  | { error: string; code?: string }
  | {
      subject: string;
      message: string;
      recipientEmail: string;
      publicDocumentUrl: string;
    }
> {
  return prepareQuoteReminderMailtoAction(quoteId);
}

/** Prépare le mailto d'envoi facture brouillon (sans changer le statut). */
export async function prepareInvoiceMailtoAction(
  invoiceId: string,
): Promise<
  | { error: string; code?: string }
  | {
      subject: string;
      message: string;
      recipientEmail: string;
      publicDocumentUrl: string;
    }
> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;
  const invoice = await getInvoiceById(supabase, invoiceId);
  if (!invoice || invoice.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (invoice.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (invoice.archived_at) {
    return { error: "Cette facture est archivée." };
  }

  const status = normalizeInvoiceStatus(invoice.status);
  if (status !== "ready") {
    return {
      error:
        status === "draft"
          ? "Validez d'abord le brouillon avant d'envoyer la facture au client."
          : "Cette facture ne peut plus être envoyée par email.",
    };
  }

  const lines = invoice.invoice_lines ?? [];
  if (lines.length === 0) {
    return { error: "La facture ne contient aucune ligne." };
  }

  const recipientEmail = getInvoiceClientEmail(
    invoice.clients,
    invoice.client_snapshot,
  );
  if (!recipientEmail) {
    return {
      error:
        "Aucune adresse email n'est renseignée pour ce client. Ajoutez-la sur la fiche client.",
    };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, invoiceId, user.id);
  if (!urlResult.ok) {
    logServerError("prepareInvoiceMailtoAction", urlResult.error, {
      invoiceId,
      userId: user.id,
      code: urlResult.code,
    });
    return {
      error: "Impossible de créer le lien public de la facture. Réessayez.",
      code: urlResult.code,
    };
  }

  const company = await getCompanyForUser(supabase, user.id);
  const companyFromSnapshot = parseCompanySnapshot(invoice.company_snapshot);
  const companyName =
    companyFromSnapshot?.party.name ??
    company?.trade_name ??
    "Votre entreprise";
  const clientName =
    clientNameFromSnapshot(invoice.client_snapshot) ??
    clientNameFromInvoice(invoice);

  const portalResult = invoice.client_id
    ? await ensureClientPortalUrl(supabase, invoice.client_id, user.id)
    : null;

  const defaults = buildInvoiceMailtoDefaults({
    clientName,
    companyName,
    invoiceNumber: invoiceDisplayNumber(
      invoice.invoice_number,
      invoice.id,
    ),
    totalTtc: Number(invoice.total_ttc),
    publicDocumentUrl: urlResult.url,
    clientPortalUrl: portalResult?.ok ? portalResult.url : null,
  });

  return {
    subject: defaults.subject,
    message: defaults.message,
    recipientEmail,
    publicDocumentUrl: urlResult.url,
  };
}

/** Passe une facture ready → sent au moment de l'ouverture mailto. */
export async function markInvoiceSentOnMailtoAction(
  invoiceId: string,
): Promise<ActionResult> {
  const { sendInvoiceAction } = await import("@/lib/actions/invoices");
  return sendInvoiceAction(invoiceId);
}

/** Prépare une relance facture (sent / overdue) — ne modifie pas le statut. */
export async function prepareInvoiceReminderMailtoAction(
  invoiceId: string,
  templateId: ReminderTemplateId = DEFAULT_REMINDER_TEMPLATE_ID,
  overrides?: { subject?: string; message?: string },
): Promise<
  | { error: string; code?: string }
  | {
      subject: string;
      message: string;
      recipientEmail: string;
      publicDocumentUrl: string;
    }
> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;
  const invoice = await getInvoiceById(supabase, invoiceId);
  if (!invoice || invoice.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (invoice.document_type !== "invoice") {
    return { error: "Document introuvable." };
  }

  if (!canSendInvoiceReminder(invoice)) {
    return { error: "Cette facture ne peut pas faire l'objet d'une relance." };
  }

  const lines = invoice.invoice_lines ?? [];
  if (lines.length === 0) {
    return { error: "La facture ne contient aucune ligne." };
  }

  const recipientEmail = getInvoiceClientEmail(
    invoice.clients,
    invoice.client_snapshot,
  );
  if (!recipientEmail) {
    return {
      error:
        "Ajoutez une adresse email au client pour préparer la relance.",
      code: "missing_email",
    };
  }

  const urlResult = await ensurePublicDocumentUrl(supabase, invoiceId, user.id);
  if (!urlResult.ok) {
    logServerError("prepareInvoiceReminderMailtoAction", urlResult.error, {
      invoiceId,
      userId: user.id,
      code: urlResult.code,
    });
    return {
      error: "Impossible de récupérer le lien de la facture. Réessayez.",
      code: urlResult.code,
    };
  }

  const company = await getCompanyForUser(supabase, user.id);
  const companyFromSnapshot = parseCompanySnapshot(invoice.company_snapshot);
  const companyName =
    companyFromSnapshot?.party.name ??
    company?.trade_name ??
    "Votre entreprise";
  const clientName =
    clientNameFromSnapshot(invoice.client_snapshot) ??
    clientNameFromInvoice(invoice);

  const reminderContext: ReminderTemplateContext = {
    clientName,
    companyName,
    invoiceNumber: invoiceDisplayNumber(invoice.invoice_number, invoice.id),
    totalTtc: Number(invoice.total_ttc),
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
  };

  const resolvedTemplateId = isReminderTemplateId(templateId)
    ? templateId
    : DEFAULT_REMINDER_TEMPLATE_ID;

  const built = buildReminderFromTemplate(resolvedTemplateId, reminderContext);
  const subject = overrides?.subject?.trim() || built.subject;
  const baseMessage = overrides?.message?.trim() || built.message;
  const portalResult = invoice.client_id
    ? await ensureClientPortalUrl(supabase, invoice.client_id, user.id)
    : null;

  const message = appendClientPortalLink(
    appendInvoiceReminderPublicLink(baseMessage, urlResult.url),
    portalResult?.ok ? portalResult.url : null,
  );

  return {
    subject,
    message,
    recipientEmail,
    publicDocumentUrl: urlResult.url,
  };
}

/** Vérifie que la facture peut faire l'objet d'une relance mailto. */
export async function validateInvoiceReminderAction(
  invoiceId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };

  const { supabase, user } = auth;
  const invoice = await getInvoiceById(supabase, invoiceId);
  if (!invoice || invoice.user_id !== user.id) {
    return { error: "Facture introuvable." };
  }

  if (!canSendInvoiceReminder(invoice)) {
    return { error: "Cette facture ne peut pas faire l'objet d'une relance." };
  }

  return { success: true };
}

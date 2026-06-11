import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Pencil,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CopyPublicDocumentLinkButton } from "@/components/documents/copy-public-document-link-button";
import { InterventionLocationCard } from "@/components/documents/intervention-location-card";
import { ArchiveInvoiceDialog } from "@/components/invoices/archive-invoice-dialog";
import { DeleteDraftInvoiceDialog } from "@/components/invoices/delete-draft-invoice-dialog";
import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { RestoreInvoiceButton } from "@/components/invoices/restore-invoice-button";
import { DuplicateInvoiceButton } from "@/components/invoices/duplicate-invoice-button";
import { DownloadInvoicePdfButton } from "@/components/invoices/download-invoice-pdf-button";
import { DownloadInvoiceReceiptButton } from "@/components/invoices/download-invoice-receipt-button";
import { InvoicePaymentReceived } from "@/components/invoices/invoice-payment-received";
import { InvoiceReminderButton } from "@/components/invoices/invoice-reminder-button";
import { InvoiceRemindersSection } from "@/components/invoices/invoice-reminders-section";
import { SendInvoiceEmailButton } from "@/components/invoices/send-invoice-email-button";
import { ValidateInvoiceDraftButton } from "@/components/invoices/validate-invoice-draft-button";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceTotalsSummary } from "@/components/invoices/invoice-totals-summary";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
  getInvoiceOnlyById,
} from "@/lib/data/invoices";
import {
  getInvoiceClientDisplayName,
  getInvoiceClientEmail,
} from "@/lib/invoices/client-contact";
import { canSendInvoiceReminder } from "@/lib/invoices/reminder-eligibility";
import { canDownloadPaymentReceipt } from "@/lib/invoices/receipt-eligibility";
import {
  formatCurrency,
  roundMoney,
  type InvoiceTotals,
} from "@/lib/invoices/calculate";
import {
  getEffectiveInvoiceStatus,
  isImplicitlyOverdue,
} from "@/lib/invoices/overdue";
import {
  canArchiveInvoice,
  canRestoreInvoice,
  isInvoiceArchived,
} from "@/lib/invoices/archive";
import {
  canCopyInvoicePublicLink,
  canSendInvoiceByEmail,
  invoiceDisplayNumber,
  invoiceHasVisibleActions,
  isInvoiceContentFrozen,
  isInvoiceEditable,
  normalizeInvoiceStatus,
} from "@/lib/invoices/status";
import { getCompanyForUser } from "@/lib/auth/profile";
import { getSentAutoReminderTypes, listInvoiceReminders } from "@/lib/data/invoice-reminders";
import { computeNextAutoReminderDate } from "@/lib/invoices/reminders";
import { createPageMetadata, pageTitles } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const invoice = await getInvoiceOnlyById(supabase, id);

  if (!invoice) {
    return createPageMetadata(pageTitles.invoiceDetail);
  }

  return createPageMetadata(
    invoiceDisplayNumber(invoice.invoice_number, invoice.id),
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const invoice = await getInvoiceOnlyById(supabase, id);
  if (!invoice || invoice.user_id !== user.id) {
    notFound();
  }

  const clientLabel =
    clientNameFromSnapshot(invoice.client_snapshot) ??
    clientNameFromInvoice(invoice);
  const lines = invoice.invoice_lines ?? [];

  const subtotal_ht = roundMoney(
    lines.reduce((s, l) => s + Number(l.line_total_ht), 0),
  );
  const subtotal_vat = roundMoney(
    lines.reduce((s, l) => s + Number(l.line_vat), 0),
  );
  const totals: InvoiceTotals = {
    subtotal_ht,
    subtotal_vat,
    total_ht: Number(invoice.total_ht),
    total_vat: Number(invoice.total_vat),
    total_ttc: Number(invoice.total_ttc),
  };

  const invoiceStatus = normalizeInvoiceStatus(invoice.status);
  const editable = isInvoiceEditable(invoiceStatus);
  const archived = isInvoiceArchived(invoice.archived_at);
  const showArchive = canArchiveInvoice(invoiceStatus, invoice.archived_at);
  const showRestore = canRestoreInvoice(invoice.archived_at);
  const snapshotFrozen = isInvoiceContentFrozen(invoiceStatus);
  const displayStatus = getEffectiveInvoiceStatus(
    invoiceStatus,
    invoice.due_date,
  );
  const showOverdueHint =
    invoiceStatus !== "paid" &&
    isImplicitlyOverdue(invoiceStatus, invoice.due_date);

  const showReminder = canSendInvoiceReminder({
    status: invoiceStatus,
    archived_at: invoice.archived_at,
  });
  const showCopyPublicLink =
    !archived && canCopyInvoicePublicLink(invoiceStatus);
  const clientEmail = getInvoiceClientEmail(
    invoice.clients,
    invoice.client_snapshot,
  );
  const clientName =
    clientNameFromSnapshot(invoice.client_snapshot) ??
    getInvoiceClientDisplayName(invoice, invoice.client_snapshot);

  const hasStatusActions = invoiceHasVisibleActions(invoiceStatus);
  const showDeleteDraft = !archived && editable;
  const showValidateDraft =
    !archived && invoiceStatus === "draft" && lines.length > 0;
  const showSendEmail =
    !archived && canSendInvoiceByEmail(invoiceStatus) && lines.length > 0;
  const showDownloadPdf = !archived && lines.length > 0;
  const showDuplicateFromTemplate = invoiceStatus !== "ready";
  const draftPdfLabel =
    invoiceStatus === "draft" ? "Télécharger le brouillon PDF" : "Télécharger PDF";
  const isPaid = invoiceStatus === "paid";
  const showPaymentReceived = !archived && isPaid;
  const showDownloadReceipt =
    !archived && canDownloadPaymentReceipt(invoice);
  const showActionsCard =
    showRestore || (!archived && (hasStatusActions || showArchive));
  const showRemindersSection = !archived && showReminder;

  const [reminders, company] = showRemindersSection
    ? await Promise.all([
        listInvoiceReminders(supabase, invoice.id),
        getCompanyForUser(supabase, user.id),
      ])
    : [[], null];

  const sentAutoTypes = showRemindersSection
    ? await getSentAutoReminderTypes(supabase, invoice.id)
    : new Set<string>();

  const nextAutoReminder =
    showRemindersSection && company
      ? computeNextAutoReminderDate(
          invoice.due_date,
          company,
          sentAutoTypes,
        )
      : null;

  return (
    <div className="w-full space-y-7 md:space-y-8">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux factures
      </Link>

      {invoice.source_quote_id ? (
        <Card>
          <CardContent className="py-4 text-sm">
            <span className="text-muted-foreground">Créée depuis le devis : </span>
            <Link
              href={`/quotes/${invoice.source_quote_id}`}
              className="font-medium text-primary hover:underline"
            >
              Voir le devis source
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm text-muted-foreground">
            {invoiceDisplayNumber(invoice.invoice_number, invoice.id)}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight break-words">
            {clientLabel}
          </h1>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <InvoiceStatusBadge status={displayStatus} />
              {archived ? <InvoiceArchivedBadge /> : null}
              {showOverdueHint ? (
                <span className="text-xs text-amber-800 dark:text-amber-300">
                  Échéance dépassée
                </span>
              ) : null}
              {snapshotFrozen && !isPaid ? (
                <span className="text-xs text-muted-foreground">
                  {invoiceStatus === "ready"
                    ? "Contenu figé — prête à envoyer"
                    : "Données figées à la validation"}
                </span>
              ) : null}
            </div>
            {showPaymentReceived ? (
              <InvoicePaymentReceived
                paidAt={invoice.paid_at}
                className="w-full sm:w-auto"
              />
            ) : null}
          </div>
        </div>
        {editable && invoiceStatus !== "draft" ? (
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "shrink-0 gap-1",
            )}
          >
            <Pencil className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Modifier</span>
          </Link>
        ) : null}
      </div>

      <InterventionLocationCard snapshot={invoice.client_location_snapshot} />

      <Card>
        <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
          <div className="flex gap-2 text-sm">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Émission</p>
              <p>{formatDate(invoice.issue_date)}</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Échéance</p>
              <p>{formatDate(invoice.due_date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
          <CardTitle className="text-base font-semibold tracking-tight">
            Lignes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-5 pb-6 pt-0 sm:px-6">
          <ul className="divide-y divide-border/50">
            {lines.map((line) => (
              <li key={line.id} className="py-4 first:pt-0 last:pb-0">
                <p className="font-medium">{line.description}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Number(line.quantity)} × {formatCurrency(Number(line.unit_price_ht))} HT
                  {" · "}TVA {Number(line.vat_rate)} %
                </p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {formatCurrency(Number(line.line_total_ttc))} TTC
                </p>
              </li>
            ))}
          </ul>
          <InvoiceTotalsSummary
            totals={totals}
            discountPercent={invoice.discount_percent}
            discountAmount={invoice.discount_amount}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {showSendEmail ? (
          <SendInvoiceEmailButton
            invoiceId={invoice.id}
            variant="default"
            disabled={!clientEmail}
            disabledReason={
              !clientEmail
                ? "Ajoutez une adresse email au client pour préparer l'envoi."
                : undefined
            }
          />
        ) : null}
        {showDownloadPdf ? (
          <DownloadInvoicePdfButton
            invoiceId={invoice.id}
            label={draftPdfLabel}
          />
        ) : null}
        {showDownloadReceipt ? (
          <DownloadInvoiceReceiptButton invoiceId={invoice.id} />
        ) : null}
        {showValidateDraft ? (
          <ValidateInvoiceDraftButton invoiceId={invoice.id} />
        ) : null}
        {editable && invoiceStatus === "draft" ? (
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full justify-center gap-2 sm:w-auto",
            )}
          >
            <Pencil className="size-4" aria-hidden />
            Modifier
          </Link>
        ) : null}
        {showReminder ? (
          <InvoiceReminderButton
            invoiceId={invoice.id}
            recipientEmail={clientEmail}
            disabled={!clientEmail}
            disabledReason={
              !clientEmail
                ? "Ajoutez l'email du client pour envoyer une relance."
                : undefined
            }
          />
        ) : null}
        {showCopyPublicLink ? (
          <CopyPublicDocumentLinkButton
            documentId={invoice.id}
            documentKind="invoice"
          />
        ) : null}
        <DuplicateInvoiceButton invoiceId={invoice.id} />
        {showDuplicateFromTemplate ? (
          <Link
            href={`/invoices/new?from=${invoice.id}`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-11 justify-center",
            )}
          >
            Créer à partir de celle-ci
          </Link>
        ) : null}
      </div>

      {showRemindersSection && company ? (
        <InvoiceRemindersSection
          invoiceId={invoice.id}
          reminders={reminders}
          autoRemindersDisabled={invoice.auto_reminders_disabled}
          autoRemindersEnabled={company.auto_reminders_enabled}
          nextAutoReminder={nextAutoReminder}
        />
      ) : null}

      {invoice.payment_terms || invoice.notes || showActionsCard ? (
        <section
          className="space-y-5 md:space-y-6"
          aria-label="Conditions et actions"
        >
          {invoice.payment_terms ? (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                <p className="text-sm leading-[1.7] whitespace-pre-wrap text-muted-foreground">
                  {invoice.payment_terms}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {invoice.notes ? (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                <p className="text-sm leading-[1.7] whitespace-pre-wrap text-muted-foreground">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {showActionsCard ? (
            <Card>
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 px-5 pb-6 pt-0 sm:px-6">
                {hasStatusActions ? (
                  <InvoiceStatusActions
                    embedded
                    invoiceId={invoice.id}
                    currentStatus={invoiceStatus}
                  />
                ) : null}
                {showRestore ? (
                  <div
                    className={cn(
                      hasStatusActions && "border-t border-border/50 pt-5",
                    )}
                  >
                    <RestoreInvoiceButton invoiceId={invoice.id} />
                  </div>
                ) : null}
                {showArchive ? (
                  <div
                    className={cn(
                      (hasStatusActions || showRestore) &&
                        "border-t border-border/50 pt-5",
                    )}
                  >
                    <ArchiveInvoiceDialog
                      invoiceId={invoice.id}
                      invoiceNumber={invoice.invoice_number}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}

      {showDeleteDraft ? (
        <section
          className="flex flex-col gap-3 border-t border-border/50 pt-6 md:pt-7"
          aria-label="Suppression du brouillon"
        >
          <p className="text-sm text-muted-foreground">
            Cette facture est encore un brouillon. Vous pouvez la supprimer
            définitivement si vous ne souhaitez plus la conserver.
          </p>
          <DeleteDraftInvoiceDialog
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoice_number}
            variant="outline"
          />
        </section>
      ) : null}

      {archived ? (
        <p className="text-sm text-muted-foreground">
          Cette facture est masquée du tableau de bord et du chiffre
          d&apos;affaires.
        </p>
      ) : null}
    </div>
  );
}

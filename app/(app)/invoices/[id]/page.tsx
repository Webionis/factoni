import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { InvoiceEinvoicingCard } from "@/components/einvoicing/invoice-einvoicing-card";
import { CopyPublicDocumentLinkButton } from "@/components/documents/copy-public-document-link-button";
import { InterventionLocationCard } from "@/components/documents/intervention-location-card";
import { ArchiveInvoiceDialog } from "@/components/invoices/archive-invoice-dialog";
import { DeleteDraftInvoiceDialog } from "@/components/invoices/delete-draft-invoice-dialog";
import { InvoiceDetailDates, InvoiceDetailSidebar } from "@/components/invoices/invoice-detail-sidebar";
import { InvoiceLinesTable } from "@/components/invoices/invoice-lines-table";
import { PageHeader } from "@/components/layout/page-header";
import { RestoreInvoiceButton } from "@/components/invoices/restore-invoice-button";
import { DuplicateInvoiceButton } from "@/components/invoices/duplicate-invoice-button";
import { DownloadInvoicePdfButton } from "@/components/invoices/download-invoice-pdf-button";
import { DownloadFacturXButton } from "@/components/documents/download-factur-x-button";
import { DownloadInvoiceReceiptButton } from "@/components/invoices/download-invoice-receipt-button";
import { InvoiceReminderButton } from "@/components/invoices/invoice-reminder-button";
import { InvoiceRemindersSection } from "@/components/invoices/invoice-reminders-section";
import { SendInvoiceEmailButton } from "@/components/invoices/send-invoice-email-button";
import { ValidateInvoiceDraftButton } from "@/components/invoices/validate-invoice-draft-button";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/data/clients";
import {
  getCompanyEinvoicingSettings,
  getLatestInvoiceTransmission,
} from "@/lib/data/einvoicing";
import { isPlatformEinvoicingActive } from "@/lib/e-invoicing/config";
import { isEinvoicingTransmissionConfigured } from "@/lib/e-invoicing/resolve-provider";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
  getInvoiceOnlyById,
} from "@/lib/data/invoices";
import { assessInvoiceEinvoicingReadiness } from "@/lib/e-invoicing/readiness";
import { prepareInvoicePdfData } from "@/lib/pdf/prepare-data";
import {
  getInvoiceClientEmail,
} from "@/lib/invoices/client-contact";
import { canSendInvoiceReminder } from "@/lib/invoices/reminder-eligibility";
import { canDownloadPaymentReceipt } from "@/lib/invoices/receipt-eligibility";
import { buildDocumentTotalsDisplay } from "@/lib/invoices/document-totals";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
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
  const vatRegime =
    parseCompanySnapshot(invoice.company_snapshot)?.vatRegime ?? "standard";
  const totals = buildDocumentTotalsDisplay(invoice, vatRegime);

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

  const hasStatusActions = invoiceHasVisibleActions(invoiceStatus);
  const showDeleteDraft = !archived && editable;
  const showValidateDraft =
    !archived && invoiceStatus === "draft" && lines.length > 0;
  const showSendEmail =
    !archived && canSendInvoiceByEmail(invoiceStatus) && lines.length > 0;
  const showDownloadPdf = !archived && lines.length > 0;
  const isPreSendInvoice =
    invoiceStatus === "draft" || invoiceStatus === "ready";
  const showClassicPdfDownload = showDownloadPdf && isPreSendInvoice;
  const showFacturXDownload = showDownloadPdf && !isPreSendInvoice;
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
  const showEinvoicingCard =
    !archived &&
    lines.length > 0 &&
    invoiceStatus !== "draft" &&
    invoiceStatus !== "ready" &&
    invoiceStatus !== "cancelled";

  const [reminders, company, einvoicingContext] = await Promise.all([
    showRemindersSection
      ? listInvoiceReminders(supabase, invoice.id)
      : Promise.resolve([]),
    showRemindersSection || showEinvoicingCard
      ? getCompanyForUser(supabase, user.id)
      : Promise.resolve(null),
    showEinvoicingCard
      ? (async () => {
          const [client, settings, latestTransmission] = await Promise.all([
            getClientById(supabase, invoice.client_id),
            getCompanyEinvoicingSettings(supabase, invoice.company_id),
            getLatestInvoiceTransmission(supabase, invoice.id),
          ]);
          if (!client) {
            return null;
          }
          const pdfData = await prepareInvoicePdfData(
            invoice,
            supabase,
            user.id,
          );
          const report = assessInvoiceEinvoicingReadiness({
            invoice,
            client,
            pdfData,
            providerConfigured: isEinvoicingTransmissionConfigured(settings),
          });
          return { report, latestTransmission };
        })()
      : Promise.resolve(null),
  ]);

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

  const detailActions = (
    <>
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
      {showClassicPdfDownload ? (
        <DownloadInvoicePdfButton
          invoiceId={invoice.id}
          label={draftPdfLabel}
        />
      ) : null}
      {showFacturXDownload ? (
        <DownloadFacturXButton
          apiPath={`/api/invoices/${invoice.id}/factur-x`}
          label="Télécharger Factur-X"
          variant="default"
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
            "h-11 w-full justify-center gap-2",
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
            "h-11 w-full justify-center",
          )}
        >
          Créer à partir de celle-ci
        </Link>
      ) : null}
    </>
  );

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux factures
      </Link>

      <PageHeader
        eyebrow={invoiceDisplayNumber(invoice.invoice_number, invoice.id)}
        title={clientLabel}
        action={
          editable && invoiceStatus !== "draft" ? (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1",
              )}
            >
              <Pencil className="size-4" aria-hidden />
              Modifier
            </Link>
          ) : undefined
        }
      />

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

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <InterventionLocationCard snapshot={invoice.client_location_snapshot} />

          <InvoiceDetailDates
            issueDate={invoice.issue_date}
            dueDate={invoice.due_date}
            className="md:hidden"
          />

          <Card>
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
              <CardTitle className="text-base font-semibold tracking-tight">
                Lignes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-6 pt-0 sm:px-6">
              <InvoiceLinesTable lines={lines} />
            </CardContent>
          </Card>

          <div className="md:hidden">
            <InvoiceDetailSidebar
              displayStatus={displayStatus}
              archived={archived}
              showOverdueHint={showOverdueHint}
              snapshotFrozen={snapshotFrozen}
              isPaid={isPaid}
              invoiceStatus={invoiceStatus}
              showPaymentReceived={showPaymentReceived}
              paidAt={invoice.paid_at}
              totals={totals}
              discountPercent={invoice.discount_percent}
              discountAmount={invoice.discount_amount}
              actions={detailActions}
            />
          </div>

          {einvoicingContext ? (
            <InvoiceEinvoicingCard
              invoiceId={invoice.id}
              report={einvoicingContext.report}
              latestTransmission={einvoicingContext.latestTransmission}
              platformPaEnabled={isPlatformEinvoicingActive()}
            />
          ) : null}

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

        <div className="hidden md:block">
          <InvoiceDetailDates
            issueDate={invoice.issue_date}
            dueDate={invoice.due_date}
            className="mb-4"
          />
          <InvoiceDetailSidebar
            displayStatus={displayStatus}
            archived={archived}
            showOverdueHint={showOverdueHint}
            snapshotFrozen={snapshotFrozen}
            isPaid={isPaid}
            invoiceStatus={invoiceStatus}
            showPaymentReceived={showPaymentReceived}
            paidAt={invoice.paid_at}
            totals={totals}
            discountPercent={invoice.discount_percent}
            discountAmount={invoice.discount_amount}
            actions={detailActions}
          />
        </div>
      </div>
    </div>
  );
}

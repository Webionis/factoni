import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CopyPublicDocumentLinkButton } from "@/components/documents/copy-public-document-link-button";
import { InterventionLocationCard } from "@/components/documents/intervention-location-card";
import { InvoiceLinesTable } from "@/components/invoices/invoice-lines-table";
import { PageHeader } from "@/components/layout/page-header";
import { DuplicateQuoteButton } from "@/components/quotes/duplicate-quote-button";
import { QuoteClientReminderButton } from "@/components/quotes/quote-client-reminder-button";
import {
  QuoteDetailDates,
  QuoteDetailSidebar,
} from "@/components/quotes/quote-detail-sidebar";
import { QuoteInvoiceActionButton } from "@/components/quotes/quote-invoice-action-button";
import { DeleteDraftQuoteDialog } from "@/components/quotes/delete-draft-quote-dialog";
import { DownloadQuotePdfButton } from "@/components/quotes/download-quote-pdf-button";
import { QuoteDepositSection } from "@/components/quotes/quote-deposit-section";
import { SendQuoteEmailButton } from "@/components/quotes/send-quote-email-button";
import { ValidateQuoteDraftButton } from "@/components/quotes/validate-quote-draft-button";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import { getQuoteById } from "@/lib/data/quotes";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import { buildDocumentTotalsDisplay } from "@/lib/invoices/document-totals";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import {
  getEffectiveQuoteStatus,
  quoteHasVisibleActions,
} from "@/lib/quotes/expiry";
import { canRemindQuoteClient } from "@/lib/quotes/reminder-eligibility";
import {
  getQuoteInvoiceActionMode,
  resolveQuoteInvoiceId,
} from "@/lib/quotes/balance-invoice-action";
import {
  canCopyQuotePublicLink,
  canSendQuoteByEmail,
  isQuoteContentFrozen,
  isQuoteEditable,
  normalizeQuoteStatus,
  quoteDisplayNumber,
} from "@/lib/quotes/status";
import { createPageMetadata, pageTitles } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: QuoteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const quote = await getQuoteById(supabase, id);

  if (!quote) {
    return createPageMetadata(pageTitles.quoteDetail);
  }

  return createPageMetadata(quoteDisplayNumber(quote.invoice_number, quote.id));
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quote = await getQuoteById(supabase, id);
  if (!quote || quote.user_id !== user.id) {
    notFound();
  }

  const quoteStatus = normalizeQuoteStatus(quote.status);
  const displayStatus = getEffectiveQuoteStatus(quoteStatus, quote.due_date);
  const clientLabel =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);
  const archived = isInvoiceArchived(quote.archived_at);
  const editable = isQuoteEditable(quoteStatus);
  const snapshotFrozen = isQuoteContentFrozen(quoteStatus);
  const lines = quote.invoice_lines ?? [];
  const vatRegime =
    parseCompanySnapshot(quote.company_snapshot)?.vatRegime ?? "standard";
  const totals = buildDocumentTotalsDisplay(quote, vatRegime);

  const hasStatusActions = quoteHasVisibleActions(
    quoteStatus,
    quote.due_date,
    quote.converted_to_invoice_id,
  );
  const showDeleteDraft = !archived && editable;
  const showValidateDraft =
    !archived && quoteStatus === "draft" && lines.length > 0;
  const showSendEmail =
    !archived && canSendQuoteByEmail(quoteStatus) && lines.length > 0;
  const showDownloadPdf = !archived && lines.length > 0;
  const draftPdfLabel =
    quoteStatus === "draft"
      ? "Télécharger le brouillon PDF"
      : "Télécharger PDF";
  const showCopyPublicLink =
    !archived && canCopyQuotePublicLink(quoteStatus);
  const showQuoteReminder =
    !archived &&
    lines.length > 0 &&
    canRemindQuoteClient(
      quoteStatus,
      quote.due_date,
      quote.converted_to_invoice_id,
      quote.archived_at,
    );
  const quoteInvoiceActionMode = getQuoteInvoiceActionMode({
    status: quoteStatus,
    depositStatus: quote.quote_deposit_status,
    balanceInvoiceId: quote.quote_balance_invoice_id,
    convertedToInvoiceId: quote.converted_to_invoice_id,
  });
  const quoteInvoiceId = resolveQuoteInvoiceId(quote);
  const showQuoteAccepted =
    !archived &&
    (quoteStatus === "accepted" ||
      quoteStatus === "deposit_requested" ||
      quoteStatus === "deposit_paid" ||
      quoteStatus === "invoiced");
  const showDepositSection =
    !archived &&
    (quoteStatus === "accepted" ||
      quoteStatus === "deposit_requested" ||
      quoteStatus === "deposit_paid");
  const showActionsCard = !archived && hasStatusActions;
  const showFooter =
    quote.payment_terms || quote.notes || showActionsCard;

  const clientEmail = getInvoiceClientEmail(quote.clients, quote.client_snapshot);

  const detailActions = (
    <>
      {showSendEmail ? (
        <SendQuoteEmailButton
          quoteId={quote.id}
          variant="default"
          disabled={!clientEmail}
          disabledReason={
            !clientEmail
              ? "Ajoutez l'email du client pour préparer l'envoi."
              : undefined
          }
        />
      ) : null}
      {showDownloadPdf ? (
        <DownloadQuotePdfButton quoteId={quote.id} label={draftPdfLabel} />
      ) : null}
      {showCopyPublicLink ? (
        <CopyPublicDocumentLinkButton
          documentId={quote.id}
          documentKind="quote"
        />
      ) : null}
      {showValidateDraft ? (
        <ValidateQuoteDraftButton quoteId={quote.id} />
      ) : null}
      {editable && quoteStatus === "draft" ? (
        <Link
          href={`/quotes/${quote.id}/edit`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full justify-center gap-2",
          )}
        >
          <Pencil className="size-4" aria-hidden />
          Modifier
        </Link>
      ) : null}
      {showQuoteReminder ? (
        <QuoteClientReminderButton
          quoteId={quote.id}
          disabled={!clientEmail}
          disabledReason={
            !clientEmail
              ? "Ajoutez une adresse email au client pour préparer la relance."
              : undefined
          }
        />
      ) : null}
      {quoteInvoiceActionMode !== "none" ? (
        <QuoteInvoiceActionButton
          quoteId={quote.id}
          mode={quoteInvoiceActionMode}
          invoiceId={quoteInvoiceId}
        />
      ) : null}
      {!archived && quoteStatus !== "draft" ? (
        <DuplicateQuoteButton quoteId={quote.id} />
      ) : null}
    </>
  );

  const sidebarProps = {
    displayStatus,
    archived,
    snapshotFrozen,
    quoteStatus,
    showQuoteAccepted,
    acceptedAt: quote.accepted_at,
    totals,
    discountPercent: quote.discount_percent,
    discountAmount: quote.discount_amount,
    actions: detailActions,
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <Link
        href="/quotes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux devis
      </Link>

      <PageHeader
        eyebrow={quoteDisplayNumber(quote.invoice_number, quote.id)}
        title={clientLabel}
      />

      {quote.converted_to_invoice_id ? (
        <Card>
          <CardContent className="py-4 text-sm">
            <span className="text-muted-foreground">Facture générée : </span>
            <Link
              href={`/invoices/${quote.converted_to_invoice_id}`}
              className="font-medium text-primary hover:underline"
            >
              Voir la facture
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {quote.quote_balance_invoice_id ? (
        <Card>
          <CardContent className="py-4 text-sm">
            <span className="text-muted-foreground">Facture de solde : </span>
            <Link
              href={`/invoices/${quote.quote_balance_invoice_id}`}
              className="font-medium text-primary hover:underline"
            >
              Voir la facture de solde (brouillon)
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          {showDepositSection ? <QuoteDepositSection quote={quote} /> : null}

          <InterventionLocationCard snapshot={quote.client_location_snapshot} />

          <QuoteDetailDates
            issueDate={quote.issue_date}
            validityDate={quote.due_date}
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
            <QuoteDetailSidebar {...sidebarProps} />
          </div>

          {showFooter ? (
            <section
              className="space-y-5 md:space-y-6"
              aria-label="Conditions et actions"
            >
              {quote.payment_terms ? (
                <Card>
                  <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                    <CardTitle className="text-base font-semibold tracking-tight">
                      Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                    <p className="text-sm leading-[1.7] whitespace-pre-wrap text-muted-foreground">
                      {quote.payment_terms}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {quote.notes ? (
                <Card>
                  <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                    <CardTitle className="text-base font-semibold tracking-tight">
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                    <p className="text-sm leading-[1.7] whitespace-pre-wrap text-muted-foreground">
                      {quote.notes}
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
                  <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                    <QuoteStatusActions
                      embedded
                      quoteId={quote.id}
                      currentStatus={quoteStatus}
                      validityDate={quote.due_date}
                      convertedToInvoiceId={quote.converted_to_invoice_id}
                    />
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
                Ce devis est encore un brouillon. Vous pouvez le supprimer
                définitivement si vous ne souhaitez plus le conserver.
              </p>
              <DeleteDraftQuoteDialog quoteId={quote.id} variant="outline" />
            </section>
          ) : null}
        </div>

        <div className="hidden md:block">
          <QuoteDetailDates
            issueDate={quote.issue_date}
            validityDate={quote.due_date}
            className="mb-4"
          />
          <QuoteDetailSidebar {...sidebarProps} />
        </div>
      </div>
    </div>
  );
}

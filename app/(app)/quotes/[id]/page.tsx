import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CopyPublicDocumentLinkButton } from "@/components/documents/copy-public-document-link-button";
import { InterventionLocationCard } from "@/components/documents/intervention-location-card";
import { DuplicateQuoteButton } from "@/components/quotes/duplicate-quote-button";
import { QuoteClientReminderButton } from "@/components/quotes/quote-client-reminder-button";
import { QuoteInvoiceActionButton } from "@/components/quotes/quote-invoice-action-button";
import { DeleteDraftQuoteDialog } from "@/components/quotes/delete-draft-quote-dialog";
import { DownloadQuotePdfButton } from "@/components/quotes/download-quote-pdf-button";
import { QuoteAcceptanceReceived } from "@/components/quotes/quote-acceptance-received";
import { QuoteDepositSection } from "@/components/quotes/quote-deposit-section";
import { SendQuoteEmailButton } from "@/components/quotes/send-quote-email-button";
import { ValidateQuoteDraftButton } from "@/components/quotes/validate-quote-draft-button";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { InvoiceTotalsSummary } from "@/components/invoices/invoice-totals-summary";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
} from "@/lib/data/invoices";
import { getQuoteById } from "@/lib/data/quotes";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import { formatCurrency, roundMoney, type InvoiceTotals } from "@/lib/invoices/calculate";
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

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
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
  const displayStatus = getEffectiveQuoteStatus(
    quoteStatus,
    quote.due_date,
  );
  const clientLabel =
    clientNameFromSnapshot(quote.client_snapshot) ??
    clientNameFromInvoice(quote);
  const archived = isInvoiceArchived(quote.archived_at);
  const editable = isQuoteEditable(quoteStatus);
  const snapshotFrozen = isQuoteContentFrozen(quoteStatus);
  const lines = quote.invoice_lines ?? [];

  const subtotal_ht = roundMoney(
    lines.reduce((s, l) => s + Number(l.line_total_ht), 0),
  );
  const subtotal_vat = roundMoney(
    lines.reduce((s, l) => s + Number(l.line_vat), 0),
  );
  const totals: InvoiceTotals = {
    subtotal_ht,
    subtotal_vat,
    total_ht: Number(quote.total_ht),
    total_vat: Number(quote.total_vat),
    total_ttc: Number(quote.total_ttc),
  };

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

  return (
    <div className="w-full space-y-7 md:space-y-8">
      <Link
        href="/quotes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux devis
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm text-muted-foreground">
            {quoteDisplayNumber(quote.invoice_number, quote.id)}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight break-words">
            {clientLabel}
          </h1>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <QuoteStatusBadge status={displayStatus} />
              {archived ? <InvoiceArchivedBadge /> : null}
              {snapshotFrozen ? (
                <span className="text-xs text-muted-foreground">
                  {quoteStatus === "ready"
                    ? "Contenu figé — prêt à envoyer"
                    : "Données figées à la validation"}
                </span>
              ) : null}
            </div>
            {showQuoteAccepted ? (
              <QuoteAcceptanceReceived
                acceptedAt={quote.accepted_at}
                className="w-full sm:w-auto"
              />
            ) : null}
          </div>
        </div>
      </div>

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

      {showDepositSection ? <QuoteDepositSection quote={quote} /> : null}

      <InterventionLocationCard snapshot={quote.client_location_snapshot} />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Card>
          <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 px-5 pb-5 text-sm sm:px-6 sm:pb-6">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" aria-hidden />
              <span>Émission : {formatDate(quote.issue_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" aria-hidden />
              <span>Validité : {formatDate(quote.due_date)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant TTC
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(Number(quote.total_ttc))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
          <CardTitle className="text-base font-semibold tracking-tight">
            Lignes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-5 pb-6 pt-0 sm:px-6">
          <ul className="divide-y divide-border/50">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{line.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {line.quantity} × {formatCurrency(Number(line.unit_price_ht))} HT
                    {" · "}TVA {line.vat_rate}%
                  </p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  {formatCurrency(Number(line.line_total_ttc))}
                </p>
              </li>
            ))}
          </ul>
          <Separator />
          <InvoiceTotalsSummary
            totals={totals}
            discountPercent={quote.discount_percent}
            discountAmount={quote.discount_amount}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
              "h-11 w-full justify-center gap-2 sm:w-auto",
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
  );
}

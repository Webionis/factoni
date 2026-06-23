import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmInvoicePaymentSideEffects } from "@/components/public/confirm-invoice-payment-side-effects";
import { PublicDocumentMobileBar } from "@/components/public/public-document-mobile-bar";
import { DownloadPublicDocumentButton } from "@/components/public/download-public-document-button";
import { AcceptPublicQuoteButton } from "@/components/public/accept-public-quote-button";
import { PayInvoiceButton } from "@/components/public/pay-invoice-button";
import { PayQuoteDepositButton } from "@/components/public/pay-quote-deposit-button";
import { PublicInvoicePaymentBanner } from "@/components/public/public-invoice-payment-banner";
import { PublicQuoteAcceptedBanner } from "@/components/public/public-quote-accepted-banner";
import { buttonVariants } from "@/components/ui/button";
import { InterventionLocationCard } from "@/components/documents/intervention-location-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientPortalUrlForDocument } from "@/lib/client-portal/data";
import { countInvoiceReminders } from "@/lib/data/invoice-reminders";
import {
  getPublicDocumentByToken,
  markQuoteViewedByPublicToken,
} from "@/lib/data/public-documents";
import { getArtisanStripePaymentStatus } from "@/lib/data/stripe-connect";
import { formatCurrency } from "@/lib/invoices/calculate";
import { canDownloadPaymentReceipt } from "@/lib/invoices/receipt-eligibility";
import {
  getEffectiveInvoiceStatus,
  isEffectivelyOverdue,
} from "@/lib/invoices/overdue";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncPaymentFromCheckoutSessionId } from "@/lib/payments/sync-from-checkout";
import {
  canPayQuoteDeposit,
  getQuoteDepositInfo,
  normalizeQuoteDepositStatus,
} from "@/lib/quotes/deposit";
import {
  canAcceptQuote,
  getEffectiveQuoteStatus,
} from "@/lib/quotes/expiry";
import {
  INVOICE_STATUS_LABELS,
  invoiceDisplayNumber,
  normalizeInvoiceStatus,
} from "@/lib/invoices/status";
import { isStripeConfigured } from "@/lib/stripe/client";
import {
  normalizeQuoteStatus,
  QUOTE_STATUS_LABELS,
  quoteDisplayNumber,
} from "@/lib/quotes/status";
import { parseClientSnapshot, parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { createClient } from "@/lib/supabase/server";
import { formatFrenchCalendarDate, formatFrenchDateTime } from "@/lib/format/datetime";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

interface PublicDocumentPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string; session_id?: string }>;
}

export const metadata: Metadata = {
  title: `Document — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(dateStr: string): string {
  return formatFrenchCalendarDate(dateStr, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PublicDocumentPage({
  params,
  searchParams,
}: PublicDocumentPageProps) {
  const { token } = await params;
  const { payment: paymentQuery, session_id: checkoutSessionId } =
    await searchParams;
  const supabase = await createClient();

  let paymentSyncResult = null;
  if (paymentQuery === "success" && checkoutSessionId?.trim()) {
    paymentSyncResult = await syncPaymentFromCheckoutSessionId(checkoutSessionId);
  }

  const payload = await getPublicDocumentByToken(supabase, token);

  if (!payload) {
    notFound();
  }

  const doc = payload.document;
  const lines = [...payload.lines].sort((a, b) => a.sort_order - b.sort_order);
  const isQuote = (doc.document_type ?? "invoice") === "quote";

  if (isQuote && doc.status === "sent") {
    await markQuoteViewedByPublicToken(supabase, token);
  }

  const company = parseCompanySnapshot(doc.company_snapshot);
  const client = parseClientSnapshot(doc.client_snapshot);
  const companyName = company?.party.name ?? siteConfig.name;
  const clientName = client?.name ?? "Client";

  const numberLabel = isQuote
    ? quoteDisplayNumber(doc.invoice_number, doc.id)
    : invoiceDisplayNumber(doc.invoice_number, doc.id);

  const quoteStatus = normalizeQuoteStatus(doc.status);
  const effectiveQuoteStatus = isQuote
    ? getEffectiveQuoteStatus(quoteStatus, doc.due_date)
    : null;

  const isAccepted =
    isQuote &&
    (quoteStatus === "accepted" ||
      quoteStatus === "deposit_requested" ||
      quoteStatus === "deposit_paid" ||
      quoteStatus === "invoiced");
  const stripeStatus = isStripeConfigured()
    ? await getArtisanStripePaymentStatus(doc.user_id)
    : null;

  const quoteDepositInfo = isQuote
    ? getQuoteDepositInfo({
        ...doc,
        invoice_lines: lines,
        clients: null,
      } as Parameters<typeof getQuoteDepositInfo>[0])
    : null;
  const depositPaid =
    isQuote &&
    normalizeQuoteDepositStatus(doc.quote_deposit_status) === "paid";
  const canPayDeposit =
    isQuote &&
    !depositPaid &&
    canPayQuoteDeposit(doc) &&
    Boolean(stripeStatus?.isReadyForPayments);
  const canAccept =
    isQuote &&
    canAcceptQuote(
      quoteStatus,
      doc.due_date,
      doc.converted_to_invoice_id,
    );

  const invoiceStatus = !isQuote ? normalizeInvoiceStatus(doc.status) : null;
  const effectiveInvoiceStatus =
    invoiceStatus != null
      ? getEffectiveInvoiceStatus(invoiceStatus, doc.due_date)
      : null;

  const isInvoicePaid = invoiceStatus === "paid";
  const isInvoiceCancelled = invoiceStatus === "cancelled";
  const isInvoiceReadyPreview = invoiceStatus === "ready";
  const isQuoteReadyPreview = isQuote && quoteStatus === "ready";
  const totalTtc = Number(doc.total_ttc);

  const paymentSyncSucceeded = paymentSyncResult?.success === true;
  const paymentPendingConfirmation =
    !isQuote &&
    paymentQuery === "success" &&
    !isInvoicePaid &&
    !paymentSyncSucceeded;
  const depositPendingConfirmation =
    isQuote &&
    paymentQuery === "success" &&
    !depositPaid &&
    !paymentSyncSucceeded;

  const canPayInvoice =
    !isQuote &&
    !isInvoicePaid &&
    !isInvoiceCancelled &&
    !paymentPendingConfirmation &&
    effectiveInvoiceStatus != null &&
    (effectiveInvoiceStatus === "sent" || effectiveInvoiceStatus === "overdue") &&
    totalTtc > 0 &&
    Boolean(stripeStatus?.isReadyForPayments);

  const paymentBannerVariant = isInvoicePaid
    ? "paid"
    : paymentPendingConfirmation
      ? "pending"
      : paymentQuery === "success"
        ? "success"
        : null;

  const showPaymentCancelled =
    paymentQuery === "cancelled" && canPayInvoice && !paymentPendingConfirmation;

  const pdfUrl = `/api/public/d/${token}/pdf`;
  const receiptUrl = `/api/public/d/${token}/receipt`;
  const showDownloadReceipt = !isQuote && canDownloadPaymentReceipt(doc);
  const amountLabel = formatCurrency(totalTtc);
  const isInvoiceOverdue =
    !isQuote &&
    invoiceStatus != null &&
    isEffectivelyOverdue(invoiceStatus, doc.due_date) &&
    !isInvoicePaid &&
    !isInvoiceCancelled;

  const reminderCount =
    isInvoiceOverdue && !isQuote
      ? await countInvoiceReminders(createAdminClient(), doc.id)
      : 0;

  const showPaymentSideEffectsConfirm =
    paymentQuery === "success" && Boolean(checkoutSessionId?.trim());
  const depositReceiptUrl = `/api/public/d/${token}/deposit-receipt`;
  const clientPortalUrl = await getClientPortalUrlForDocument(
    doc.client_id,
    doc.user_id,
  );
  const depositAmountLabel = quoteDepositInfo?.depositAmount
    ? formatCurrency(quoteDepositInfo.depositAmount)
    : "";

  return (
    <div className="min-h-dvh overflow-x-hidden overscroll-x-none touch-pan-y bg-[#f8fafc] px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] dark:bg-background sm:py-8 sm:pt-8">
      {showPaymentSideEffectsConfirm && checkoutSessionId ? (
        <ConfirmInvoicePaymentSideEffects sessionId={checkoutSessionId} />
      ) : null}
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{companyName}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">
            {isQuote ? "Devis" : "Facture"} {numberLabel}
          </h1>
          <p className="mt-1 text-muted-foreground">{clientName}</p>
        </div>

        {isInvoiceReadyPreview ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-100">
            Aperçu de la facture — le paiement en ligne sera disponible après
            envoi au client.
          </div>
        ) : null}

        {isQuoteReadyPreview ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-100">
            Aperçu du devis — la signature en ligne sera disponible après envoi
            au client.
          </div>
        ) : null}

        {paymentBannerVariant ? (
          <PublicInvoicePaymentBanner
            variant={paymentBannerVariant}
            totalTtc={totalTtc}
            paidAt={doc.paid_at}
          />
        ) : null}

        {showPaymentCancelled ? (
          <PublicInvoicePaymentBanner variant="cancelled" />
        ) : null}

        {isInvoiceOverdue ? (
          <div className="rounded-xl border border-red-200/80 bg-red-50/60 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Paiement en retard
            </p>
            <p className="mt-1 text-sm text-red-700/90 dark:text-red-100/90">
              {reminderCount > 0
                ? reminderCount === 1
                  ? "Une relance de paiement vous a été envoyée."
                  : `${reminderCount} relances de paiement vous ont été envoyées.`
                : "La date d'échéance de cette facture est dépassée."}
            </p>
          </div>
        ) : null}

        {isAccepted ? (
          <PublicQuoteAcceptedBanner
            acceptedAt={doc.accepted_at}
            acceptedByName={doc.accepted_by_name}
            totalTtc={totalTtc}
            pdfUrl={pdfUrl}
          />
        ) : null}

        {depositPendingConfirmation ? (
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Confirmation de l&apos;acompte en cours…
            </p>
            <p className="mt-1 text-sm text-blue-800/90 dark:text-blue-100/90">
              Votre paiement Stripe est en cours de validation. Cette page se
              mettra à jour automatiquement.
            </p>
          </div>
        ) : null}

        {isQuote &&
        quoteDepositInfo?.depositStatus === "requested" &&
        !depositPaid &&
        !depositPendingConfirmation ? (
          <div className="rounded-xl border border-orange-200/80 bg-orange-50/60 px-5 py-4 dark:border-orange-900/40 dark:bg-orange-950/20">
            <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
              Acompte demandé
            </p>
            <p className="mt-1 text-sm text-orange-800/90 dark:text-orange-100/90">
              {quoteDepositInfo.typeLabel} — {depositAmountLabel}
            </p>
          </div>
        ) : null}

        {depositPaid ? (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-5 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Acompte payé
            </p>
            {quoteDepositInfo?.paidAt ? (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Payé le{" "}
                {formatFrenchDateTime(quoteDepositInfo.paidAt)}
                {" · "}
                {depositAmountLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        <InterventionLocationCard
          snapshot={doc.client_location_snapshot}
          className="gap-0 shadow-sm"
        />

        <Card className="gap-0 shadow-sm">
          <CardHeader className="border-b border-border/40 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 px-5 pb-6 pt-4 text-sm leading-relaxed sm:px-6 sm:pb-7 sm:pt-5">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Émission</span>
              <span>{formatDate(doc.issue_date)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {isQuote ? "Validité" : "Échéance"}
              </span>
              <span>{formatDate(doc.due_date)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border/50 pt-3.5">
              <span className="font-medium">Total TTC</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(totalTtc)}
              </span>
            </div>
            {isQuote && effectiveQuoteStatus ? (
              <p className="pt-0.5 text-xs leading-relaxed text-muted-foreground">
                Statut : {QUOTE_STATUS_LABELS[effectiveQuoteStatus]}
              </p>
            ) : null}
            {!isQuote && effectiveInvoiceStatus ? (
              <p className="pt-0.5 text-xs leading-relaxed text-muted-foreground">
                Statut : {INVOICE_STATUS_LABELS[effectiveInvoiceStatus]}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="gap-0 shadow-sm">
          <CardHeader className="border-b border-border/40 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">Détail</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
            <ul className="divide-y divide-border/50">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{line.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {line.quantity} × {formatCurrency(Number(line.unit_price_ht))} HT
                    </p>
                  </div>
                  <p className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(Number(line.line_total_ttc))}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {canPayInvoice ? (
            <PayInvoiceButton
              token={token}
              amountLabel={amountLabel}
              className="hidden sm:inline-flex"
            />
          ) : null}
          {canPayDeposit ? (
            <PayQuoteDepositButton
              token={token}
              amountLabel={depositAmountLabel}
              className="hidden sm:inline-flex"
            />
          ) : null}
          <DownloadPublicDocumentButton
            url={pdfUrl}
            label="Télécharger le PDF"
            kind="pdf"
            variant={
              isAccepted || canPayInvoice || showDownloadReceipt
                ? "outline"
                : "default"
            }
          />
          {showDownloadReceipt ? (
            <DownloadPublicDocumentButton
              url={receiptUrl}
              label="Télécharger le reçu"
              kind="receipt"
              variant="outline"
            />
          ) : null}
          {depositPaid ? (
            <DownloadPublicDocumentButton
              url={depositReceiptUrl}
              label="Reçu d'acompte"
              kind="receipt"
              variant="outline"
            />
          ) : null}
          {canAccept ? (
            <AcceptPublicQuoteButton
              token={token}
              quoteNumber={numberLabel}
              totalTtc={totalTtc}
              companyName={companyName}
              className="hidden sm:inline-flex"
            />
          ) : null}
        </div>

        <PublicDocumentMobileBar
          token={token}
          canPayInvoice={canPayInvoice}
          canPayDeposit={canPayDeposit}
          canAccept={canAccept}
          amountLabel={amountLabel}
          depositAmountLabel={depositAmountLabel}
          quoteNumber={numberLabel}
          totalTtc={totalTtc}
          companyName={companyName}
        />

        <div className="space-y-2 pb-[env(safe-area-inset-bottom)] text-center text-xs text-muted-foreground">
          {clientPortalUrl ? (
            <p>
              <Link
                href={clientPortalUrl}
                className="font-medium text-primary underline underline-offset-2"
              >
                Accéder à mon espace client
              </Link>
            </p>
          ) : null}
          <p>
            Document partagé via{" "}
            <Link href={siteConfig.productionUrl} className="underline underline-offset-2">
              Factoni
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

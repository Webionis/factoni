import { NextResponse } from "next/server";

import { getPublicDocumentByToken } from "@/lib/data/public-documents";
import { getArtisanStripePaymentStatus } from "@/lib/data/stripe-connect";
import { canPayQuoteDeposit } from "@/lib/quotes/deposit";
import { logStripeDepositCheckout } from "@/lib/quotes/deposit-paid-transition-log";
import { logServerError } from "@/lib/logger";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
import { parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { quoteDisplayNumber } from "@/lib/quotes/status";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createQuoteDepositCheckoutSession } from "@/lib/stripe/checkout";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Les paiements en ligne ne sont pas disponibles." },
      { status: 503 },
    );
  }

  let body: { token?: string };
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }

  const supabase = await createClient();
  const payload = await getPublicDocumentByToken(supabase, token);
  if (!payload) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const doc = payload.document;
  if ((doc.document_type ?? "invoice") !== "quote") {
    return NextResponse.json(
      { error: "Ce lien ne concerne pas un devis." },
      { status: 400 },
    );
  }

  if (!canPayQuoteDeposit(doc)) {
    return NextResponse.json(
      { error: "Cet acompte ne peut pas être payé en ligne." },
      { status: 409 },
    );
  }

  const stripeStatus = await getArtisanStripePaymentStatus(doc.user_id);
  if (!stripeStatus?.isReadyForPayments || !stripeStatus.accountId) {
    return NextResponse.json(
      { error: "L'artisan n'a pas activé les paiements en ligne." },
      { status: 409 },
    );
  }

  const company = parseCompanySnapshot(doc.company_snapshot);
  const clientEmail = getInvoiceClientEmail(null, doc.client_snapshot);
  const depositAmount = Number(doc.quote_deposit_amount);

  try {
    const session = await createQuoteDepositCheckoutSession({
      quoteId: doc.id,
      publicToken: token,
      connectedAccountId: stripeStatus.accountId,
      amountTtc: depositAmount,
      quoteNumber: quoteDisplayNumber(doc.invoice_number, doc.id),
      companyName: company?.party.name ?? "Entreprise",
      clientEmail,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossible de créer la session de paiement." },
        { status: 500 },
      );
    }

    logStripeDepositCheckout("session_created", {
      sessionId: session.id,
      quoteId: doc.id,
      amount: depositAmount,
      token,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logServerError("stripe.checkout-deposit", error, { quoteId: doc.id, token });
    return NextResponse.json(
      { error: "Impossible d'ouvrir le paiement. Réessayez." },
      { status: 500 },
    );
  }
}

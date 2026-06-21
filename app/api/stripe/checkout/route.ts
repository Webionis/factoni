import { NextResponse } from "next/server";

import { getPublicDocumentByToken } from "@/lib/data/public-documents";
import { hasFeatureForUser } from "@/lib/billing/feature-guard";
import { getArtisanStripePaymentStatus } from "@/lib/data/stripe-connect";
import { logServerError } from "@/lib/logger";
import { invoiceDisplayNumber, toInvoiceStatus } from "@/lib/invoices/status";
import { parseClientSnapshot, parseCompanySnapshot } from "@/lib/pdf/parse-snapshots";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createInvoiceCheckoutSession } from "@/lib/stripe/checkout";
import { getInvoiceClientEmail } from "@/lib/invoices/client-contact";
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
  if ((doc.document_type ?? "invoice") !== "invoice") {
    return NextResponse.json(
      { error: "Ce lien ne concerne pas une facture." },
      { status: 400 },
    );
  }

  const status = toInvoiceStatus(doc.status);
  if (status === "paid") {
    return NextResponse.json(
      { error: "Cette facture est déjà payée." },
      { status: 409 },
    );
  }

  if (status !== "sent" && status !== "overdue") {
    return NextResponse.json(
      { error: "Cette facture ne peut pas être payée en ligne." },
      { status: 409 },
    );
  }

  const hasPayments = await hasFeatureForUser(
    supabase,
    doc.user_id,
    "automation",
  );
  if (!hasPayments) {
    return NextResponse.json(
      { error: "Les paiements en ligne ne sont pas activés pour ce professionnel." },
      { status: 403 },
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

  try {
    const session = await createInvoiceCheckoutSession({
      invoiceId: doc.id,
      publicToken: token,
      connectedAccountId: stripeStatus.accountId,
      amountTtc: Number(doc.total_ttc),
      invoiceNumber: invoiceDisplayNumber(doc.invoice_number, doc.id),
      companyName: company?.party.name ?? "Entreprise",
      clientEmail,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Impossible de créer la session de paiement." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logServerError("stripe.checkout", error, { invoiceId: doc.id, token });
    return NextResponse.json(
      { error: "Impossible d'ouvrir le paiement. Réessayez." },
      { status: 500 },
    );
  }
}

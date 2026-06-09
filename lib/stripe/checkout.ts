import type Stripe from "stripe";

import { getAppBaseUrl, getStripeClient } from "@/lib/stripe/client";

export interface CreateInvoiceCheckoutParams {
  invoiceId: string;
  publicToken: string;
  connectedAccountId: string;
  amountTtc: number;
  invoiceNumber: string;
  companyName: string;
  clientEmail?: string | null;
}

export async function createInvoiceCheckoutSession(
  params: CreateInvoiceCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();
  const amountCents = Math.round(params.amountTtc * 100);

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Montant de facture invalide pour le paiement.");
  }

  const description = `Facture ${params.invoiceNumber} — ${params.companyName}`;

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      currency: "eur",
      customer_email: params.clientEmail?.trim() || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: description,
              description,
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: params.connectedAccountId,
        },
        // application_fee_amount: future commission Factoni
        metadata: {
          invoice_id: params.invoiceId,
          public_token: params.publicToken,
        },
      },
      metadata: {
        invoice_id: params.invoiceId,
        public_token: params.publicToken,
      },
      success_url: `${baseUrl}/d/${params.publicToken}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/d/${params.publicToken}?payment=cancelled`,
      payment_method_types: ["card"],
    },
    {
      idempotencyKey: `invoice-checkout-${params.invoiceId}-${amountCents}`,
    },
  );
}

export interface CreateQuoteDepositCheckoutParams {
  quoteId: string;
  publicToken: string;
  connectedAccountId: string;
  amountTtc: number;
  quoteNumber: string;
  companyName: string;
  clientEmail?: string | null;
}

export async function createQuoteDepositCheckoutSession(
  params: CreateQuoteDepositCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();
  const amountCents = Math.round(params.amountTtc * 100);

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Montant d'acompte invalide pour le paiement.");
  }

  const description = `Acompte devis ${params.quoteNumber} — ${params.companyName}`;

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      currency: "eur",
      customer_email: params.clientEmail?.trim() || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: description,
              description,
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: params.connectedAccountId,
        },
        metadata: {
          quote_id: params.quoteId,
          public_token: params.publicToken,
          deposit_payment: "true",
        },
      },
      metadata: {
        quote_id: params.quoteId,
        public_token: params.publicToken,
        deposit_payment: "true",
      },
      success_url: `${baseUrl}/d/${params.publicToken}?payment=success&session_id={CHECKOUT_SESSION_ID}&deposit=1`,
      cancel_url: `${baseUrl}/d/${params.publicToken}?payment=cancelled&deposit=1`,
      payment_method_types: ["card"],
    },
    {
      idempotencyKey: `quote-deposit-checkout-${params.quoteId}-${amountCents}`,
    },
  );
}

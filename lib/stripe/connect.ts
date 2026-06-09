import type Stripe from "stripe";

import { getAppBaseUrl, getStripeClient } from "@/lib/stripe/client";
import { logStripeConnectError } from "@/lib/stripe/errors";

export type StripeConnectStatus = {
  accountId: string | null;
  onboardingCompleted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  /** Paiements clients activés (checkout public). */
  isReadyForPayments: boolean;
  /** Compte Express entièrement configuré (onboarding + charges + payouts). */
  isFullyActive: boolean;
};

export function isStripeAccountFullyActive(account: Stripe.Account): boolean {
  return Boolean(
    account.details_submitted && account.charges_enabled && account.payouts_enabled,
  );
}

export function isStripeAccountOnboardingRequired(account: Stripe.Account): boolean {
  return !isStripeAccountFullyActive(account);
}

export function mapStripeAccountToStatus(
  account: Stripe.Account | null,
  stored?: Partial<StripeConnectStatus>,
): StripeConnectStatus {
  const accountId = account?.id ?? stored?.accountId ?? null;
  const chargesEnabled = account?.charges_enabled ?? stored?.chargesEnabled ?? false;
  const payoutsEnabled = account?.payouts_enabled ?? stored?.payoutsEnabled ?? false;
  const detailsSubmitted = account?.details_submitted ?? stored?.onboardingCompleted ?? false;

  const isFullyActive = account
    ? isStripeAccountFullyActive(account)
    : Boolean(
        accountId && detailsSubmitted && chargesEnabled && payoutsEnabled,
      );

  return {
    accountId,
    onboardingCompleted: detailsSubmitted,
    chargesEnabled,
    payoutsEnabled,
    isReadyForPayments: Boolean(accountId && chargesEnabled && detailsSubmitted),
    isFullyActive,
  };
}

export async function createExpressConnectAccount(params: {
  email: string;
  userId: string;
  /** Garde anti-duplication — ne jamais passer si un compte existe déjà. */
  existingAccountId?: string | null;
}): Promise<Stripe.Account> {
  const existingId = params.existingAccountId?.trim();
  if (existingId) {
    const message = `[stripe.connect] Refus accounts.create : compte existant ${existingId}`;
    if (process.env.NODE_ENV === "development") {
      console.error(message);
    }
    throw new Error(message);
  }

  const stripe = getStripeClient();

  if (process.env.NODE_ENV === "development") {
    console.info("[stripe.connect] accounts.create", {
      type: "express",
      country: "FR",
      email: params.email,
      userId: params.userId,
    });
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: params.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        factoni_user_id: params.userId,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.info("[stripe.connect] accounts.create OK", {
        accountId: account.id,
        type: account.type,
      });
    }

    return account;
  } catch (error) {
    logStripeConnectError("stripe.connect.accounts.create", error, {
      userId: params.userId,
      type: "express",
      country: "FR",
    });
    throw error;
  }
}

export async function createConnectOnboardingLink(
  accountId: string,
): Promise<string> {
  const stripe = getStripeClient();
  const baseUrl = getAppBaseUrl();
  const refreshUrl = `${baseUrl}/settings/payments`;
  const returnUrl = `${baseUrl}/settings/payments/stripe/callback`;

  if (process.env.NODE_ENV === "development") {
    console.info("[stripe.connect] accountLinks.create", {
      accountId,
      type: "account_onboarding",
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    if (process.env.NODE_ENV === "development") {
      console.info("[stripe.connect] accountLinks.create OK", {
        accountId,
        url: accountLink.url,
      });
    }

    return accountLink.url;
  } catch (error) {
    logStripeConnectError("stripe.connect.accountLinks.create", error, {
      accountId,
      type: "account_onboarding",
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });
    throw error;
  }
}

export async function retrieveConnectAccount(
  accountId: string,
): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(accountId);
}

/** Récupère un compte Express orphelin (créé côté Stripe mais non persisté en DB). */
export async function findExistingConnectAccountForUser(
  userId: string,
): Promise<string | null> {
  const stripe = getStripeClient();
  let startingAfter: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const response = await stripe.accounts.list({
      limit: 100,
      starting_after: startingAfter,
    });

    const match = response.data.find(
      (account) =>
        account.type === "express" &&
        account.metadata?.factoni_user_id === userId,
    );

    if (match?.id) {
      if (process.env.NODE_ENV === "development") {
        console.info("[stripe.connect] recovered_orphan_account", {
          userId,
          accountId: match.id,
        });
      }
      return match.id;
    }

    if (!response.has_more || response.data.length === 0) {
      break;
    }

    startingAfter = response.data[response.data.length - 1]?.id;
  }

  return null;
}

export async function createExpressDashboardLoginLink(
  accountId: string,
): Promise<string> {
  const stripe = getStripeClient();

  if (process.env.NODE_ENV === "development") {
    console.info("[stripe.connect] dashboard_login", { accountId });
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    if (process.env.NODE_ENV === "development") {
      console.info("[stripe.connect] dashboard_login OK", {
        accountId,
        url: loginLink.url,
      });
    }

    return loginLink.url;
  } catch (error) {
    logStripeConnectError("stripe.connect.dashboard_login", error, { accountId });
    throw error;
  }
}

export type StripeConnectRedirectKind = "onboarding" | "dashboard";

export async function resolveStripeConnectRedirectUrl(params: {
  account: Stripe.Account;
}): Promise<{ kind: StripeConnectRedirectKind; url: string }> {
  const accountId = params.account.id;

  if (isStripeAccountFullyActive(params.account)) {
    const url = await createExpressDashboardLoginLink(accountId);
    return { kind: "dashboard", url };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[stripe.connect] onboarding_required", {
      accountId,
      details_submitted: params.account.details_submitted,
      charges_enabled: params.account.charges_enabled,
      payouts_enabled: params.account.payouts_enabled,
    });
  }

  const url = await createConnectOnboardingLink(accountId);
  return { kind: "onboarding", url };
}

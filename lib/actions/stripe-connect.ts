"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getProfile } from "@/lib/auth/profile";
import {
  getStripeConnectProfile,
  saveStripeConnectProfile,
  syncStripeConnectProfileFromStripe,
} from "@/lib/data/stripe-connect";
import { logStripeConnectError, stripeConnectUserErrorMessage } from "@/lib/stripe/errors";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/stripe/client";
import {
  createConnectOnboardingLink,
  createExpressConnectAccount,
  findExistingConnectAccountForUser,
  mapStripeAccountToStatus,
  resolveStripeConnectRedirectUrl,
  retrieveConnectAccount,
} from "@/lib/stripe/connect";

export async function startStripeConnectOnboardingAction(): Promise<{
  error?: string;
}> {
  if (!isStripeConfigured()) {
    return { error: "Stripe n'est pas configuré sur cette instance." };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { error: auth.error ?? "Non authentifié" };
  }

  const { supabase, user } = auth;

  // Relecture fraîche — source de vérité pour éviter toute recréation.
  const profile = await getProfile(supabase, user.id);
  if (!profile?.email) {
    return { error: "Profil utilisateur introuvable." };
  }

  let accountId = profile.stripe_account_id?.trim() ?? null;

  if (!accountId) {
    accountId = await findExistingConnectAccountForUser(user.id);
    if (accountId) {
      const recoveredAccount = await retrieveConnectAccount(accountId);
      await saveStripeConnectProfile(
        supabase,
        user.id,
        mapStripeAccountToStatus(recoveredAccount, { accountId }),
      );
    }
  }

  if (process.env.NODE_ENV === "development") {
    const baseUrl = getAppBaseUrl();
    console.info("[stripe.onboarding] start", {
      userId: user.id,
      email: profile.email,
      existingAccountId: accountId,
      appUrl: baseUrl,
      refresh_url: `${baseUrl}/settings/payments`,
      return_url: `${baseUrl}/settings/payments/stripe/callback`,
    });
  }

  try {
    if (!accountId) {
      // CAS 1 — aucun compte : création Express unique.
      const account = await createExpressConnectAccount({
        email: profile.email,
        userId: user.id,
        existingAccountId: null,
      });

      const initialStatus = mapStripeAccountToStatus(account);
      const saved = await saveStripeConnectProfile(supabase, user.id, initialStatus);
      if (!saved) {
        return {
          error:
            process.env.NODE_ENV === "development"
              ? "Échec sauvegarde profil Stripe (colonnes Supabase ?)"
              : "Impossible d'enregistrer le compte Stripe.",
        };
      }

      const onboardingUrl = await createConnectOnboardingLink(account.id);
      revalidatePath("/settings/payments");
      redirect(onboardingUrl);
    }

    // CAS 2 & 3 — compte existant : jamais accounts.create.
    if (process.env.NODE_ENV === "development") {
      console.info("[stripe.connect] existing_account", { accountId });
    }

    const account = await retrieveConnectAccount(accountId);
    const status = mapStripeAccountToStatus(account, { accountId });
    await saveStripeConnectProfile(supabase, user.id, status);

    const { kind, url } = await resolveStripeConnectRedirectUrl({ account });

    if (process.env.NODE_ENV === "development") {
      console.info("[stripe.connect] redirect", { accountId, kind });
    }

    revalidatePath("/settings/payments");
    redirect(url);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logStripeConnectError("startStripeConnectOnboardingAction", error, {
      userId: user.id,
      accountId,
      step: accountId ? "existing_account_flow" : "accounts.create",
    });

    return { error: stripeConnectUserErrorMessage(error) };
  }
}

export async function syncStripeConnectStatusAction(): Promise<{
  success?: boolean;
  error?: string;
}> {
  if (!isStripeConfigured()) {
    return { error: "Stripe n'est pas configuré." };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { error: auth.error ?? "Non authentifié" };
  }

  const connectProfile = await getStripeConnectProfile(auth.supabase, auth.user.id);
  if (!connectProfile?.accountId) {
    return { error: "Aucun compte Stripe connecté." };
  }

  try {
    const status = await syncStripeConnectProfileFromStripe(
      auth.supabase,
      auth.user.id,
      connectProfile.accountId,
    );

    if (!status) {
      return { error: "Synchronisation Stripe impossible." };
    }

    revalidatePath("/settings/payments");
    return { success: true };
  } catch (error) {
    logStripeConnectError("syncStripeConnectStatusAction", error, {
      userId: auth.user.id,
      accountId: connectProfile.accountId,
    });
    return { error: stripeConnectUserErrorMessage(error) };
  }
}

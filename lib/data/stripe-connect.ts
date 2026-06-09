import type { SupabaseClient } from "@supabase/supabase-js";

import { getProfile } from "@/lib/auth/profile";
import { logServerError } from "@/lib/logger";
import {
  mapStripeAccountToStatus,
  retrieveConnectAccount,
  type StripeConnectStatus,
} from "@/lib/stripe/connect";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type StripeConnectProfile = StripeConnectStatus & {
  userId: string;
};

export async function getStripeConnectProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<StripeConnectProfile | null> {
  const profile = await getProfile(supabase, userId);
  if (!profile) return null;

  const accountId = profile.stripe_account_id;
  const onboardingCompleted = profile.stripe_onboarding_completed;
  const chargesEnabled = profile.stripe_charges_enabled;
  const payoutsEnabled = profile.stripe_payouts_enabled;

  return {
    userId,
    accountId,
    onboardingCompleted,
    chargesEnabled,
    payoutsEnabled,
    isReadyForPayments: Boolean(
      accountId && chargesEnabled && onboardingCompleted,
    ),
    isFullyActive: Boolean(
      accountId && onboardingCompleted && chargesEnabled && payoutsEnabled,
    ),
  };
}

export async function saveStripeConnectProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  status: StripeConnectStatus,
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_account_id: status.accountId,
      stripe_onboarding_completed: status.onboardingCompleted,
      stripe_charges_enabled: status.chargesEnabled,
      stripe_payouts_enabled: status.payoutsEnabled,
    })
    .eq("id", userId);

  if (error) {
    logServerError("saveStripeConnectProfile", error, { userId });
    return false;
  }

  return true;
}

export async function syncStripeConnectProfileFromStripe(
  supabase: SupabaseClient<Database>,
  userId: string,
  accountId: string,
): Promise<StripeConnectStatus | null> {
  if (!isStripeConfigured()) {
    return null;
  }

  try {
    const account = await retrieveConnectAccount(accountId);
    const status = mapStripeAccountToStatus(account, { accountId });
    await saveStripeConnectProfile(supabase, userId, status);
    return status;
  } catch (error) {
    logServerError("syncStripeConnectProfileFromStripe", error, {
      userId,
      accountId,
    });
    return null;
  }
}

export async function getArtisanStripePaymentStatus(
  userId: string,
): Promise<StripeConnectStatus | null> {
  if (!isAdminClientConfigured()) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(
      "stripe_account_id, stripe_onboarding_completed, stripe_charges_enabled, stripe_payouts_enabled",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    logServerError("getArtisanStripePaymentStatus", error, { userId });
    return null;
  }

  return mapStripeAccountToStatus(null, {
    accountId: data.stripe_account_id,
    onboardingCompleted: data.stripe_onboarding_completed,
    chargesEnabled: data.stripe_charges_enabled,
    payoutsEnabled: data.stripe_payouts_enabled,
  });
}

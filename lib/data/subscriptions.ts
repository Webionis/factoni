import type { SupabaseClient } from "@supabase/supabase-js";

import type { SubscriptionSyncPayload } from "@/lib/billing/stripe/events";
import { logServerError } from "@/lib/logger";
import type { SubscriptionRow, SubscriptionPlan } from "@/lib/billing/types";
import type { Database } from "@/types/database";

export async function getSubscriptionForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logServerError("getSubscriptionForUser", error, { userId });
    return null;
  }

  return data as SubscriptionRow | null;
}

export async function getSubscriptionByStripeCustomerId(
  supabase: SupabaseClient<Database>,
  stripeCustomerId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    logServerError("getSubscriptionByStripeCustomerId", error, {
      stripeCustomerId,
    });
    return null;
  }

  return data as SubscriptionRow | null;
}

export async function upsertSubscriptionFromStripe(
  payload: SubscriptionSyncPayload,
): Promise<void> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const baseRow = {
    user_id: payload.userId,
    plan: payload.plan,
    status: payload.status,
    stripe_customer_id: payload.stripeCustomerId,
    stripe_subscription_id: payload.stripeSubscriptionId,
    current_period_end: payload.currentPeriodEnd,
  };

  const rowWithCancel = {
    ...baseRow,
    cancel_at_period_end: payload.cancelAtPeriodEnd,
    pending_plan: payload.pendingPlan ?? null,
    pending_plan_effective_at: payload.pendingPlanEffectiveAt ?? null,
  };

  let { error } = await admin.from("subscriptions").upsert(rowWithCancel, {
    onConflict: "user_id",
  });

  if (
    error?.message?.includes("cancel_at_period_end") ||
    error?.message?.includes("pending_plan") ||
    error?.code === "PGRST204"
  ) {
    ({ error } = await admin.from("subscriptions").upsert(
      { ...baseRow, cancel_at_period_end: payload.cancelAtPeriodEnd },
      { onConflict: "user_id" },
    ));
  }

  if (error) {
    logServerError("upsertSubscriptionFromStripe", error, {
      userId: payload.userId,
      plan: payload.plan,
    });
    throw error;
  }
}

export async function upsertSubscriptionPendingChange(params: {
  userId: string;
  pendingPlan: SubscriptionPlan | null;
  pendingPlanEffectiveAt: string | null;
}): Promise<void> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { error } = await admin
    .from("subscriptions")
    .update({
      pending_plan: params.pendingPlan,
      pending_plan_effective_at: params.pendingPlanEffectiveAt,
    })
    .eq("user_id", params.userId);

  if (
    error?.message?.includes("pending_plan") ||
    error?.code === "PGRST204"
  ) {
    return;
  }

  if (error) {
    logServerError("upsertSubscriptionPendingChange", error, {
      userId: params.userId,
    });
    throw error;
  }
}

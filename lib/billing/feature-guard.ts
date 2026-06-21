import { hasFeature } from "@/lib/billing/access";
import { getFeatureDeniedMessage } from "@/lib/billing/feature-messages";
import type { FeatureKey, SubscriptionRow } from "@/lib/billing/types";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;

export async function hasFeatureForUser(
  supabase: DbClient,
  userId: string,
  feature: FeatureKey,
): Promise<boolean> {
  const subscription = await getSubscriptionForUser(supabase, userId);
  return hasFeature(subscription, feature);
}

export async function requireFeatureForUser(
  supabase: DbClient,
  userId: string,
  feature: FeatureKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await hasFeatureForUser(supabase, userId, feature);
  if (!allowed) {
    return { ok: false, error: getFeatureDeniedMessage(feature) };
  }
  return { ok: true };
}

/** Filtre une liste d'identifiants utilisateurs selon l'accès à une feature. */
export async function filterUserIdsWithFeature(
  client: DbClient,
  userIds: string[],
  feature: FeatureKey,
): Promise<Set<string>> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return new Set();

  const { data, error } = await client
    .from("subscriptions")
    .select("user_id, plan, status")
    .in("user_id", unique);

  if (error) {
    return new Set(unique);
  }

  const subscriptionByUser = new Map(
    (data ?? []).map((row) => [row.user_id, row as SubscriptionRow]),
  );

  const allowed = new Set<string>();
  for (const userId of unique) {
    const subscription = subscriptionByUser.get(userId) ?? null;
    if (hasFeature(subscription, feature)) {
      allowed.add(userId);
    }
  }

  return allowed;
}

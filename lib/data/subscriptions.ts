import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/logger";
import type { SubscriptionRow } from "@/lib/billing/types";
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

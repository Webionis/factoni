import { buildSubscriptionAccess } from "@/lib/billing/access";
import type { SubscriptionAccess } from "@/lib/billing/types";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { createClient } from "@/lib/supabase/server";

/** Charge l'accès abonnement pour l'utilisateur connecté (layouts app). */
export async function getSubscriptionAccessForSession(): Promise<SubscriptionAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const subscription = await getSubscriptionForUser(supabase, user.id);
  return buildSubscriptionAccess(subscription);
}

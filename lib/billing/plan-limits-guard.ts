import {
  buildSubscriptionAccess,
  getCurrentPlan,
} from "@/lib/billing/access";
import { isLimitsEnforced } from "@/lib/billing/launch-config";
import { checkClientLimit, checkInvoiceLimit } from "@/lib/billing/limits";
import { countClientsForUser } from "@/lib/data/clients";
import { countInvoicesForUser } from "@/lib/data/invoices";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type DbClient = SupabaseClient<Database>;

export async function requireInvoiceQuota(
  supabase: DbClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const limitsEnforced = isLimitsEnforced();
  if (!limitsEnforced) return { ok: true };

  const subscription = await getSubscriptionForUser(supabase, userId);
  const access = buildSubscriptionAccess(subscription);
  if (access.features.unlimitedInvoices) return { ok: true };

  const plan = getCurrentPlan(subscription);
  const currentCount = await countInvoicesForUser(supabase, userId);
  const check = checkInvoiceLimit(plan, currentCount, true);

  if (!check.allowed) {
    return {
      ok: false,
      error:
        check.reason ??
        "Limite de factures atteinte. Passez à l'offre Starter pour continuer.",
    };
  }

  return { ok: true };
}

export async function requireClientQuota(
  supabase: DbClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const limitsEnforced = isLimitsEnforced();
  if (!limitsEnforced) return { ok: true };

  const subscription = await getSubscriptionForUser(supabase, userId);
  const access = buildSubscriptionAccess(subscription);
  if (access.features.unlimitedClients) return { ok: true };

  const plan = getCurrentPlan(subscription);
  const currentCount = await countClientsForUser(supabase, userId);
  const check = checkClientLimit(plan, currentCount, true);

  if (!check.allowed) {
    return {
      ok: false,
      error:
        check.reason ??
        "Limite de clients atteinte. Passez à l'offre Starter pour continuer.",
    };
  }

  return { ok: true };
}

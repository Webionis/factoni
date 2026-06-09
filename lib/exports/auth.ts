import { buildSubscriptionAccess, hasFeature } from "@/lib/billing/access";
import type { SubscriptionAccess } from "@/lib/billing/types";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ExportAuthResult =
  | {
      ok: true;
      supabase: SupabaseClient<Database>;
      user: User;
      access: SubscriptionAccess;
    }
  | { ok: false; status: 401 | 403; message: string };

export async function requireAccountingExportAccess(): Promise<ExportAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, message: "Non authentifié" };
  }

  const subscription = await getSubscriptionForUser(supabase, user.id);
  if (!hasFeature(subscription, "accountingExport")) {
    return {
      ok: false,
      status: 403,
      message: "Export comptable non disponible pour votre offre",
    };
  }

  return {
    ok: true,
    supabase,
    user,
    access: buildSubscriptionAccess(subscription),
  };
}

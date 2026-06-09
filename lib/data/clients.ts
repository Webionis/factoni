import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/logger";
import type { ClientRow } from "@/lib/validations/client";
import type { Database } from "@/types/database";

export async function listClientsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ClientRow[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    logServerError("listClientsForUser", error);
    return [];
  }

  return data ?? [];
}

export async function countClientsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    logServerError("countClientsForUser", error);
    return 0;
  }

  return count ?? 0;
}

export async function getClientById(
  supabase: SupabaseClient<Database>,
  clientId: string,
): Promise<ClientRow | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    logServerError("getClientById", error, { clientId });
    return null;
  }

  return data;
}

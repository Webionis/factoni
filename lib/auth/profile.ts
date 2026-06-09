import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/logger";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    logServerError("getProfile", error, { userId });
    return null;
  }

  return data;
}

export async function isOnboardingCompleted(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const profile = await getProfile(supabase, userId);
  return profile?.onboarding_completed ?? false;
}

export async function getCompanyForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CompanyRow | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logServerError("getCompanyForUser", error, { userId });
    return null;
  }

  return data;
}

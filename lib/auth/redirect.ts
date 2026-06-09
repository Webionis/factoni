import type { SupabaseClient } from "@supabase/supabase-js";

import { isOnboardingCompleted } from "@/lib/auth/profile";
import type { Database } from "@/types/database";

export const ONBOARDING_PATH = "/onboarding";
export const DASHBOARD_PATH = "/dashboard";
export const LOGIN_PATH = "/login";

export async function resolvePostAuthPath(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return LOGIN_PATH;
  }

  const completed = await isOnboardingCompleted(supabase, user.id);
  return completed ? DASHBOARD_PATH : ONBOARDING_PATH;
}

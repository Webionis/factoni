"use server";

import { authRequiredError, isAuthSessionError } from "@/lib/actions/errors";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      supabase,
      user: null as null,
      sessionExpired: isAuthSessionError(error.message),
    };
  }

  if (!user) {
    return { supabase, user: null as null, sessionExpired: false };
  }

  return { supabase, user, sessionExpired: false };
}

type AuthFailure = {
  error: string;
  supabase: null;
  user: null;
};

type AuthSuccess = {
  error: null;
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: NonNullable<
    Awaited<ReturnType<typeof getAuthenticatedUser>>["user"]
  >;
};

export async function requireAuthenticatedUser(): Promise<
  AuthFailure | AuthSuccess
> {
  const { supabase, user, sessionExpired } = await getAuthenticatedUser();
  if (!user) {
    return {
      error: authRequiredError(sessionExpired),
      supabase: null,
      user: null,
    };
  }
  return { supabase, user, error: null };
}

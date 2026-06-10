import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isOnboardingCompleted } from "@/lib/auth/profile";
import { DASHBOARD_PATH, ONBOARDING_PATH } from "@/lib/auth/redirect";
import {
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  isAuthRoute,
  isOnboardingRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/lib/constants/routes";
import type { Database } from "@/types/database";

type MiddlewareLogEvent =
  | "env_missing"
  | "supabase_error"
  | "public_route_bypass"
  | "unhandled_error";

function middlewareLog(
  event: MiddlewareLogEvent,
  detail: Record<string, string | undefined>,
): void {
  console.log(`[middleware] ${event}`, detail);
}

function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) {
      return null;
    }
  } catch {
    return null;
  }

  const looksLikeAnonKey =
    anonKey.startsWith("eyJ") || anonKey.startsWith("sb_publishable_");
  if (!looksLikeAnonKey || anonKey.length < 20) {
    return null;
  }

  return { url, anonKey };
}

/** Routes accessibles sans session Supabase (dégradé si env invalide). */
function canBypassWithoutSupabase(pathname: string): boolean {
  if (pathname.startsWith("/d/")) return true;
  if (pathname.startsWith("/client/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/api/public/")) return true;
  if (pathname.startsWith("/api/stripe/")) return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname === "/mentions-legales" || pathname === "/confidentialite") {
    return true;
  }
  return false;
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  includeRedirectTo = false,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = DEFAULT_UNAUTHENTICATED_REDIRECT;
  url.search = "";
  if (includeRedirectTo && pathname !== DEFAULT_UNAUTHENTICATED_REDIRECT) {
    url.searchParams.set("redirectTo", pathname);
  }
  return NextResponse.redirect(url);
}

function handleDegradedAccess(
  request: NextRequest,
  pathname: string,
  reason: "env_missing" | "supabase_error",
  message?: string,
): NextResponse {
  middlewareLog(reason, { pathname, message });

  if (canBypassWithoutSupabase(pathname)) {
    middlewareLog("public_route_bypass", { pathname, reason });
    return NextResponse.next();
  }

  if (isAuthRoute(pathname) || pathname === "/") {
    middlewareLog("public_route_bypass", { pathname, reason });
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    return redirectToLogin(request, pathname, true);
  }

  if (!isPublicRoute(pathname)) {
    return redirectToLogin(request, pathname);
  }

  middlewareLog("public_route_bypass", { pathname, reason });
  return NextResponse.next();
}

function createSupabaseClient(
  request: NextRequest,
  url: string,
  anonKey: string,
): { supabase: ReturnType<typeof createServerClient<Database>>; getResponse: () => NextResponse } {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  return {
    supabase,
    getResponse: () => supabaseResponse,
  };
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const env = getSupabaseEnv();
  if (!env) {
    return handleDegradedAccess(request, pathname, "env_missing");
  }

  let supabase: ReturnType<typeof createServerClient<Database>>;
  let getSupabaseResponse: () => NextResponse;

  try {
    const client = createSupabaseClient(request, env.url, env.anonKey);
    supabase = client.supabase;
    getSupabaseResponse = client.getResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "create_client_failed";
    return handleDegradedAccess(request, pathname, "supabase_error", message);
  }

  let user = null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      middlewareLog("supabase_error", {
        pathname,
        message: error.message,
        code: error.status?.toString(),
      });
      return handleDegradedAccess(request, pathname, "supabase_error", error.message);
    }
    user = data.user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "get_user_failed";
    return handleDegradedAccess(request, pathname, "supabase_error", message);
  }

  if (!user) {
    if (isProtectedRoute(pathname)) {
      return redirectToLogin(request, pathname, true);
    }

    if (!isPublicRoute(pathname)) {
      return redirectToLogin(request, pathname);
    }

    return getSupabaseResponse();
  }

  let onboardingDone = false;

  try {
    onboardingDone = await isOnboardingCompleted(supabase, user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "onboarding_check_failed";
    middlewareLog("supabase_error", { pathname, message });
    onboardingDone = false;
  }

  if (isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = onboardingDone ? DASHBOARD_PATH : ONBOARDING_PATH;
    return NextResponse.redirect(url);
  }

  if (!onboardingDone && isProtectedRoute(pathname) && !isOnboardingRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ONBOARDING_PATH;
    return NextResponse.redirect(url);
  }

  if (onboardingDone && isOnboardingRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && onboardingDone) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_PATH;
    return NextResponse.redirect(url);
  }

  return getSupabaseResponse();
}

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

export async function updateSession(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    return new NextResponse(
      "Configuration serveur incomplète (variables Supabase manquantes).",
      { status: 503 },
    );
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (isProtectedRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = DEFAULT_UNAUTHENTICATED_REDIRECT;
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    if (!isPublicRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = DEFAULT_UNAUTHENTICATED_REDIRECT;
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const onboardingDone = await isOnboardingCompleted(supabase, user.id);

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

  return supabaseResponse;
}

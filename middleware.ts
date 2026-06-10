import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  isPublicRoute,
} from "@/lib/constants/routes";
import { updateSession } from "@/lib/supabase/middleware";

function isCronApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/cron/");
}

function safeFallbackResponse(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (isCronApiRoute(pathname) || isPublicRoute(pathname)) {
    console.log("[middleware] public_route_bypass", {
      pathname,
      reason: "unhandled_error",
    });
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = DEFAULT_UNAUTHENTICATED_REDIRECT;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  if (isCronApiRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[middleware] unhandled_error", {
      pathname: request.nextUrl.pathname,
      message,
    });
    return safeFallbackResponse(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

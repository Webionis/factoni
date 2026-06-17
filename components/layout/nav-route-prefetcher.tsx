"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  APP_MAIN_NAV_ROUTES,
  APP_NAV_PREFETCH_ROUTES,
  APP_SETTINGS_NAV_ROUTES,
} from "@/lib/constants/app-nav";

function prefetchRoutes(
  router: ReturnType<typeof useRouter>,
  routes: readonly string[],
) {
  for (const href of routes) {
    router.prefetch(href);
  }
}

/**
 * Précharge toutes les sections dès l’ouverture de l’app (y compris après
 * fermeture / rechargement) pour une navigation instantanée type « Devis ».
 */
export function NavRoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    prefetchRoutes(router, APP_MAIN_NAV_ROUTES);

    const prefetchSettings = () => {
      prefetchRoutes(router, APP_SETTINGS_NAV_ROUTES);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(prefetchSettings);
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(prefetchSettings, 400);
    return () => window.clearTimeout(timeoutId);
  }, [router]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        prefetchRoutes(router, APP_NAV_PREFETCH_ROUTES);
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return null;
}

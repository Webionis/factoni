"use client";

import { useEffect } from "react";

import {
  consumeDashboardActivityIntent,
  scrollToDashboardActivity,
  stripDashboardActivityHash,
} from "@/lib/navigation/dashboard-activity";

/** Gère le scroll vers « Activité récente » uniquement après un clic sur la cloche. */
export function DashboardActivityScroll() {
  useEffect(() => {
    stripDashboardActivityHash();

    if (consumeDashboardActivityIntent()) {
      const timeout = window.setTimeout(() => {
        scrollToDashboardActivity();
      }, 100);
      return () => window.clearTimeout(timeout);
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return null;
}

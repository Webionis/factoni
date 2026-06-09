"use client";

import { useEffect } from "react";

/**
 * Retire la classe dark sur les pages publiques (landing, auth)
 * pour ne pas hériter du thème app sur documentElement.
 */
export function PublicThemeGuard() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return null;
}

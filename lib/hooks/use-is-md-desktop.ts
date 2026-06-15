"use client";

import { useSyncExternalStore } from "react";

const MD_MEDIA_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(MD_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(MD_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** true à partir du breakpoint md (768px) — aligné shell, listes et pickers. */
export function useIsMdDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

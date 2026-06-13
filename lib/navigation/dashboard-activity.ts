export const DASHBOARD_ACTIVITY_SECTION_ID = "activite-recente";

const DASHBOARD_ACTIVITY_INTENT_KEY = "ff-dashboard-activity-intent";

export function setDashboardActivityIntent(): void {
  try {
    sessionStorage.setItem(DASHBOARD_ACTIVITY_INTENT_KEY, "1");
  } catch {
    // sessionStorage indisponible (navigation privée stricte, etc.)
  }
}

export function consumeDashboardActivityIntent(): boolean {
  try {
    if (sessionStorage.getItem(DASHBOARD_ACTIVITY_INTENT_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(DASHBOARD_ACTIVITY_INTENT_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearDashboardActivityIntent(): void {
  try {
    sessionStorage.removeItem(DASHBOARD_ACTIVITY_INTENT_KEY);
  } catch {
    // ignore
  }
}

export function scrollToDashboardActivity(
  behavior: ScrollBehavior = "smooth",
): boolean {
  const section = document.getElementById(DASHBOARD_ACTIVITY_SECTION_ID);
  if (!section) return false;
  section.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** Retire l'ancre résiduelle pour éviter le scroll automatique du navigateur. */
export function stripDashboardActivityHash(): void {
  if (window.location.hash !== `#${DASHBOARD_ACTIVITY_SECTION_ID}`) return;
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
}

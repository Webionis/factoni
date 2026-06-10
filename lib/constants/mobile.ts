import { cn } from "@/lib/utils";

/** Hauteur de la bottom nav mobile (52px). */
export const MOBILE_BOTTOM_NAV_HEIGHT = "3.25rem";

/** Cible tactile minimale iOS / Material (44px). */
export const touchTargetClassName =
  "min-h-11 min-w-11 touch-manipulation";

/** Padding bas du contenu principal (bottom nav + FAB). */
export const mobileMainPaddingBottomClassName =
  "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-10";

/** Position sticky des barres d'action formulaire au-dessus de la bottom nav. */
export const mobileStickyFooterClassName = cn(
  "sticky z-30 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur-md",
  "bottom-[calc(3.25rem+env(safe-area-inset-bottom))]",
  "md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
);

/** Barre d'action fixe en bas (pages publiques). */
export const mobileFixedActionBarClassName = cn(
  "fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(15,23,42,0.06)] bg-white/95 px-4 py-3 backdrop-blur-md",
  "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
  "dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.92)]",
  "sm:hidden",
);

/** Espace réservé sous le contenu quand une barre fixe est affichée. */
export const mobileFixedActionSpacerClassName =
  "h-[calc(4.5rem+env(safe-area-inset-bottom))] sm:hidden";

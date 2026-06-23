import { cn } from "@/lib/utils";

/** Onglet inactif — bottom nav & menu Plus mobile. */
export const mobileNavItemInactiveClassName =
  "text-[#1e293b] hover:text-[#0f172a] dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]";

/** Onglet actif — bottom nav & menu Plus mobile. */
export const mobileNavItemActiveClassName = "text-[#1d4ed8]";

export const mobileNavItemActiveBgClassName =
  "bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]";

/** Lien du menu Plus mobile. */
export const mobileMoreMenuItemClassName = cn(
  "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-[color,background-color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] touch-manipulation active:scale-[0.99]",
  mobileNavItemInactiveClassName,
  "hover:bg-[#f8fafc] active:bg-[#f1f5f9] dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08]",
);

export const mobileMoreMenuItemActiveClassName = cn(
  mobileNavItemActiveClassName,
  mobileNavItemActiveBgClassName,
);

/** Hauteur de la bottom nav mobile (52px). */
export const MOBILE_BOTTOM_NAV_HEIGHT = "3.25rem";

/** Espace sous le header mobile fixe (hauteur header + respiration + encoche). */
export const mobileMainPaddingTopClassName =
  "pt-[calc(3.5rem+1.75rem+env(safe-area-inset-top))] md:pt-10";

/** Cible tactile minimale iOS / Material (44px). */
export const touchTargetClassName =
  "min-h-11 min-w-11 touch-manipulation";

/** Padding bas du contenu principal (bottom nav + FAB). */
export const mobileMainPaddingBottomClassName =
  "pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:pb-10";

/** Position sticky des barres d'action formulaire au-dessus de la bottom nav. */
export const mobileStickyFooterClassName = cn(
  "sticky z-30 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur-md",
  "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
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

/** Rythme vertical des pages app (mobile = desktop). */
export const mobilePageStackClassName = "space-y-6 md:space-y-8";

/** Champ recherche listes — hauteur tactile 44px. */
export const mobileSearchInputClassName = "h-11 pl-10 shadow-sm";

/** Groupe de selects filtres — visible sur tous les écrans (comme desktop). */
export const listFilterGroupClassName =
  "flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row";

/** Rangée de pills filtres — mobile uniquement, scroll horizontal masqué. */
export const mobileFilterPillsRowClassName = cn(
  "-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 md:hidden",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
);

/** Liste cartes mobile (legacy — préférer dataTableScrollWrapper). */
export const mobileListStackClassName = "space-y-3 md:hidden";

/** Chevron indicatif sur cartes liste mobile. */
export const mobileListCardChevronClassName =
  "size-4 shrink-0 text-[#cbd5e1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#2563eb] dark:text-[#475569] dark:group-hover:text-[#93c5fd]";

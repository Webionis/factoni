import { cn } from "@/lib/utils";

/**
 * Design system Factoni — SaaS premium (Stripe / Linear / Pennylane).
 * Sobriété, confiance, profondeur légère.
 */

/** Ombre signature — quasi invisible, naturelle. */
export const premiumShadowClassName =
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_20px_rgba(15,23,42,0.035)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.18),0_16px_40px_rgba(0,0,0,0.18)]";

export const premiumShadowHoverClassName =
  "hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_14px_36px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_2px_6px_rgba(0,0,0,0.22),0_20px_48px_rgba(0,0,0,0.24)]";

/** Surface marketing blanche — profondeur légère sans surcharge. */
export const marketingElevatedSurfaceClassName =
  "bg-gradient-to-b from-white to-[#fafbff]";

export const premiumBorderClassName =
  "border-[rgba(15,23,42,0.06)] dark:border-[rgba(148,163,184,0.14)]";

/** Easing premium — rapide au départ, doux à l’arrivée (Stripe / Linear). */
export const easePremiumClassName = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export const transitionPremiumClassName = cn(
  "transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[180ms]",
  easePremiumClassName,
);

export const transitionPremiumSlowClassName = cn(
  "transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[220ms]",
  easePremiumClassName,
);

/** Lignes listes / activité — hover discret sans déplacement. */
export const interactiveRowClassName = cn(
  transitionPremiumClassName,
  "hover:bg-[#f8fafc] active:bg-[#f1f5f9]",
  "dark:hover:bg-white/5 dark:active:bg-white/[0.07]",
);

/** Entrée douce KPI / blocs dashboard. */
export const fadeInUpClassName =
  "motion-safe:animate-[ff-fade-in-up_0.4s_ease-out_forwards] opacity-100";

/** Filtres pill (listes). */
export const filterPillClassName = cn(
  "shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold touch-manipulation",
  transitionPremiumClassName,
);

export const filterPillActiveClassName =
  "border-[#2563eb] bg-[#2563eb] text-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_12px_rgba(37,99,235,0.15)]";

export const filterPillInactiveClassName =
  "border-[rgba(15,23,42,0.08)] bg-white text-[#64748b] shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:border-[rgba(37,99,235,0.15)] hover:text-[#0f172a] dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(30,41,59,0.5)] dark:text-[#94a3b8] dark:hover:border-[rgba(96,165,250,0.25)] dark:hover:text-[#f8fafc]";

/** Dégradé bleu discret (boutons, nav actif). */
export const primaryGradientClassName =
  "bg-gradient-to-b from-[#3478ff] to-[#2563eb]";

export const primaryGradientInsetClassName =
  "ring-1 ring-inset ring-white/20";

export const surfaceCardClassName = cn(
  "rounded-2xl bg-white dark:bg-[rgba(30,41,59,0.72)]",
  premiumBorderClassName,
  premiumShadowClassName,
);

export const surfaceCardHoverClassName = cn(
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.14)]",
  premiumShadowHoverClassName,
  "dark:hover:border-[rgba(96,165,250,0.22)]",
);

/** Listes — hover sans décalage (mature, type Stripe). */
export const surfaceCardInteractiveClassName = cn(
  surfaceCardClassName,
  surfaceCardHoverClassName,
);

/** Carte liste mobile — tactile premium, alignée tableaux desktop. */
export const mobileListCardClassName = cn(
  surfaceCardInteractiveClassName,
  "min-h-[4.75rem] p-4 touch-manipulation transition-transform duration-150 active:scale-[0.995] sm:p-5",
);

/** KPI & blocs dashboard. */
export const surfaceCardStatClassName = cn(
  surfaceCardClassName,
  surfaceCardHoverClassName,
  "ff-kpi-stat",
);

export const formSectionClassName = cn(
  surfaceCardClassName,
  "space-y-5 p-6 sm:p-7",
);

export const formSectionTitleClassName =
  "text-[15px] font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]";

export const formSectionDescriptionClassName =
  "text-sm text-[#64748b] dark:text-[#94a3b8]";

/** Panneau formulaire unique (paramètres) — sections séparées par des traits. */
export const formPanelClassName = cn(
  surfaceCardClassName,
  "divide-y divide-[rgba(15,23,42,0.06)] dark:divide-[rgba(148,163,184,0.1)]",
);

export const formPanelSectionClassName = "space-y-4 p-5 sm:p-6";

export const formPanelSectionTitleClassName =
  "text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8] dark:text-[#64748b]";

export const formPanelFooterClassName = cn(
  "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6",
);

export const sectionHeadingClassName =
  "text-base font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]";

export const sectionSubheadingClassName =
  "text-sm text-[#64748b] dark:text-[#94a3b8]";

/** Encart informatif dans une card (billing, exports, etc.). */
export const surfaceInsetClassName = cn(
  "rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] text-[13px] leading-relaxed text-[#64748b]",
  "dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.5)] dark:text-[#94a3b8]",
);

export const surfaceInsetEmphasisClassName =
  "font-medium text-[#334155] dark:text-[#cbd5e1]";

/** Bandeau info léger (page exports, etc.). */
export const surfaceInfoBannerClassName = cn(
  surfaceCardClassName,
  "border-[rgba(37,99,235,0.08)] bg-[#f8fafc]/50",
  "dark:border-[rgba(96,165,250,0.15)] dark:bg-[rgba(37,99,235,0.08)]",
);

const inputBaseClassName = cn(
  "block h-11 w-full min-w-0 max-w-full rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3.5 text-[15px] text-[#0f172a] outline-none md:text-sm",
  "dark:border-[rgba(148,163,184,0.18)] dark:bg-[rgba(15,23,42,0.75)] dark:text-[#f8fafc]",
  transitionPremiumClassName,
);

const inputFocusClassName =
  "placeholder:text-[#94a3b8] dark:placeholder:text-slate-500 focus-visible:border-[#60a5fa] focus-visible:ring-4 focus-visible:ring-[#2563eb]/18 focus-visible:shadow-[0_0_0_1px_rgba(37,99,235,0.08),0_2px_8px_rgba(37,99,235,0.06)] dark:focus-visible:border-blue-400/60 dark:focus-visible:ring-blue-500/22 dark:focus-visible:shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_2px_12px_rgba(37,99,235,0.08)]";

export const inputClassName = cn(inputBaseClassName, inputFocusClassName);

export const selectClassName = cn(inputBaseClassName, inputFocusClassName);

/** Conteneur date/heure — évite le débordement Safari iOS dans les modales étroites. */
export const nativeDateTimeFieldClassName =
  "w-full min-w-0 max-w-full overflow-hidden";

export const dateTimeInputClassName = cn(
  inputClassName,
  "appearance-none pr-2 [-webkit-appearance:none]",
);

/** Landing & pages publiques — rythme éditorial, sans glassmorphism. */
export const marketingHeaderClassName =
  "sticky top-0 z-50 border-b border-[rgba(15,23,42,0.06)] bg-white/98 supports-[backdrop-filter]:bg-white/90";

export const marketingSectionClassName = "bg-[#f8fafc]";

export const marketingSectionAltClassName = "bg-white";

export const marketingSectionMutedClassName = "bg-[#f1f5f9]/60";

export const marketingEyebrowClassName =
  "inline-flex items-center rounded-full border border-[rgba(37,99,235,0.15)] bg-[rgba(37,99,235,0.06)] px-3.5 py-1 text-[13px] font-semibold tracking-tight text-[#2563eb]";

/** Badge offre de lancement — dashboard & surfaces produit */
export const betaBadgeClassName =
  "inline-flex shrink-0 items-center rounded-full border border-[rgba(37,99,235,0.12)] bg-[rgba(37,99,235,0.06)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#2563eb] dark:border-[rgba(96,165,250,0.2)] dark:bg-[rgba(59,130,246,0.12)] dark:text-[#93c5fd]";

export const betaBadgeHintClassName =
  "text-sm font-medium text-[#64748b]";

export const marketingHeroTitleClassName =
  "text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[#0f172a] text-balance sm:text-[2.75rem] lg:max-w-[16ch] lg:text-[3.125rem]";

export const marketingHeroLeadClassName =
  "max-w-lg text-lg leading-relaxed text-[#64748b] text-pretty";

export const marketingSectionTitleClassName =
  "text-center text-2xl font-semibold tracking-[-0.02em] text-[#0f172a] sm:text-[1.75rem]";

export const marketingSectionLeadClassName =
  "mx-auto mt-3 max-w-xl text-center text-[15px] leading-[1.65] text-[#64748b] md:mt-4 md:text-base md:leading-relaxed";

/** Item bandeau confiance landing */
export const marketingTrustItemClassName = cn(
  "ff-marketing-elevated-card flex gap-3 rounded-xl border border-[rgba(15,23,42,0.07)] p-3.5 md:gap-3.5 md:p-4",
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.14)]",
);

export const marketingFeatureCardClassName = cn(
  "ff-marketing-elevated-card rounded-2xl border border-[rgba(15,23,42,0.07)] p-5 sm:p-8",
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.14)]",
  premiumShadowHoverClassName,
);

export const marketingTestimonialCardClassName = cn(
  "ff-marketing-elevated-card flex h-full flex-col rounded-2xl border border-[rgba(15,23,42,0.07)] p-5 sm:p-7",
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.12)]",
  premiumShadowHoverClassName,
);

export const marketingFaqItemClassName = cn(
  "ff-marketing-elevated-card group rounded-2xl border border-[rgba(15,23,42,0.07)]",
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.12)] open:border-[rgba(37,99,235,0.16)] open:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_12px_32px_rgba(37,99,235,0.07)]",
);

/** Pills confiance hero / CTA */
export const marketingTrustPillClassName =
  "inline-flex items-center rounded-full border border-[rgba(15,23,42,0.08)] bg-white/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#64748b] shadow-[0_1px_2px_rgba(15,23,42,0.03)]";

/** CTA final landing — card centrée, sobre (Stripe / Linear). */
export const marketingCtaCardClassName = cn(
  "mx-auto max-w-2xl rounded-2xl border border-[rgba(15,23,42,0.06)] bg-white px-6 py-10 text-center sm:px-12 sm:py-14",
  premiumShadowClassName,
  transitionPremiumClassName,
  "hover:border-[rgba(37,99,235,0.1)]",
  premiumShadowHoverClassName,
);

export const marketingCtaTitleClassName =
  "text-xl font-medium tracking-tight text-[#0f172a] sm:text-2xl sm:leading-snug";

export const marketingCtaLeadClassName =
  "mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#64748b] sm:mt-5 sm:text-base";

/** Pages légales publiques */
export const legalPageSectionCardClassName = cn(
  "rounded-2xl border border-[rgba(15,23,42,0.06)] bg-white p-6 sm:p-7",
  premiumShadowClassName,
);

export const legalPageSectionTitleClassName =
  "text-base font-semibold tracking-tight text-[#0f172a]";

export const legalPageDisclaimerClassName =
  "rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] px-4 py-3 text-[13px] leading-relaxed text-[#94a3b8]";

/** Carte auth — alignée dashboard, plus de respiration. */
export const authCardClassName = cn(
  surfaceCardClassName,
  "overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.05)]",
);

export const authCardHeaderClassName = "gap-2 px-7 pt-8 pb-1 sm:px-8 sm:pt-9";

export const authCardTitleClassName =
  "text-xl font-semibold tracking-tight text-[#0f172a]";

export const authCardDescriptionClassName =
  "text-[15px] leading-relaxed text-[#64748b]";

export const authCardContentClassName = "space-y-5 px-7 pb-2 sm:px-8";

export const authCardFooterClassName =
  "flex-col gap-5 border-t border-[rgba(15,23,42,0.06)] bg-transparent px-7 py-7 sm:px-8";

/** Navigation sidebar — états hover / actif premium. */
export const sidebarNavItemClassName = cn(
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
  transitionPremiumClassName,
  "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]",
  "dark:text-[#94a3b8] dark:hover:bg-white/[0.06] dark:hover:text-[#f8fafc]",
);

export const sidebarNavItemActiveClassName =
  "bg-[rgba(37,99,235,0.08)] text-[#2563eb] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.1)] dark:bg-[rgba(59,130,246,0.14)] dark:text-[#93c5fd] dark:shadow-[inset_0_0_0_1px_rgba(96,165,250,0.18)]";

/** Label de groupe dans la sidebar. */
export const sidebarNavGroupLabelClassName =
  "px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8] first:pt-1 dark:text-[#64748b]";

/** Tableau métier (factures, devis, clients) — surface carte, coins clipés. */
export const dataTableClassName = cn(surfaceCardClassName, "w-full overflow-hidden");

/** Conteneur unique : carte + scroll horizontal si le tableau dépasse. */
export const dataTableScrollWrapperClassName = cn(
  dataTableClassName,
  "min-w-0 w-full overflow-x-auto overscroll-x-contain",
  "[-webkit-overflow-scrolling:touch]",
  "md:overflow-x-visible",
);

/** Balise <table> — colonnes proportionnelles sur mobile, largeur min sur desktop. */
export const dataTableElementClassName =
  "w-full max-md:table-fixed border-collapse text-sm md:min-w-[36rem]";

/** Tableau sans scroll horizontal — contenu contraint à la largeur du bloc. */
export const dataTableContainedWrapperClassName = cn(
  dataTableClassName,
  "min-w-0 w-full overflow-x-hidden",
);

export const dataTableContainedElementClassName =
  "w-full table-fixed border-collapse text-sm";

/** Badge statut compact dans les lignes de tableau sur mobile. */
export const dataTableStatusBadgeClassName =
  "max-md:h-5 max-md:gap-1 max-md:px-1.5 max-md:text-[10px] md:h-6 md:px-2.5 md:text-xs";

export const dataTableHeadClassName =
  "border-b border-[rgba(15,23,42,0.06)] bg-[#f8fafc]/80 text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748b] dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.4)] dark:text-[#94a3b8]";

export const dataTableRowClassName = cn(
  interactiveRowClassName,
  "border-b border-[rgba(15,23,42,0.04)] last:border-0 dark:border-[rgba(148,163,184,0.08)]",
);

/** Accent titre page — identité Factoni. */
export const pageEyebrowClassName =
  "text-xs font-semibold uppercase tracking-widest text-[#2563eb]/90 dark:text-[#60a5fa]/90";

export const pageTitleClassName =
  "text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-3xl";

export const pageDescriptionClassName =
  "max-w-2xl text-[13px] leading-relaxed text-[#64748b] dark:text-[#94a3b8] sm:text-[15px]";

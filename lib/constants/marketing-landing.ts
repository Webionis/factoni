/**
 * Tokens landing uniquement — ne pas confondre avec le design system app.
 */
export const landingSurface = {
  hero: "bg-[#f8fafc]",
  white: "bg-white",
  muted: "bg-gradient-to-b from-[#f8fafc] to-[#f4f7fb]",
  soft: "bg-gradient-to-b from-[#f8fafc] to-[#f5f8fb]",
  blueTint: "bg-gradient-to-b from-[#f6f9ff] to-[#f0f4ff]",
  footer: "bg-gradient-to-b from-[#f8fafc] to-[#f4f7fb]",
} as const;

/** Padding horizontal — 20px mobile, 32px desktop */
export const landingSectionXClassName = "px-5 md:px-8";

/** Rythme vertical mobile — compact premium */
export const landingMobileSectionStrongClassName = "py-7 md:py-14";
export const landingMobileSectionLightClassName = "py-6 md:py-12";
export const landingMobileSectionCompactClassName = "py-5 md:py-10";
export const landingMobileSectionBreathClassName = "py-4 md:py-10";

/** Transitions landing — easing premium */
export const landingMotionClassName =
  "transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

export const landingMobileStackGapClassName = "flex flex-col gap-3.5 md:gap-8";

/** Legacy aliases (desktop inchangé) */
export const landingSectionYClassName = landingMobileSectionLightClassName;
export const landingSectionYCompactClassName = landingMobileSectionCompactClassName;

export const landingPageClassName = "flex flex-1 flex-col overflow-x-hidden";

/** Typographie mobile premium */
export const landingMobileBodyClassName =
  "text-[15px] leading-[1.7] text-[#475569] md:text-base md:leading-relaxed md:text-[#64748b]";

export const landingMobileBodyMutedClassName =
  "text-[15px] leading-[1.7] text-[#64748b]";

export const landingMobileTitleClassName =
  "text-[1.75rem] font-semibold leading-[1.22] tracking-[-0.025em] text-[#0f172a] md:text-[1.75rem]";

export const landingMobileSectionTitleClassName =
  "text-center text-[1.75rem] font-semibold leading-[1.22] tracking-[-0.025em] text-[#0f172a] md:text-[1.75rem]";

export const landingMobileHeroTitleClassName =
  "text-[2rem] font-semibold leading-[1.14] tracking-[-0.035em] text-[#0f172a] text-balance md:text-5xl lg:text-[3.35rem] lg:leading-[1.05]";

export const landingMobileCardTitleClassName =
  "text-lg font-semibold tracking-tight text-[#0f172a] md:text-lg";

export const landingMobileFeatureCardClassName =
  "ff-landing-card-lift w-full rounded-2xl border border-[rgba(15,23,42,0.06)] bg-white p-5 md:p-8";

export const landingMobileMockClassName =
  "ff-landing-mock-premium w-full overflow-hidden rounded-2xl bg-white";

export const landingMobileDarkKpiClassName = "ff-landing-dark-kpi";

export const landingMobileDarkPanelClassName = "ff-landing-dark-panel";

export const landingMobileCtaPrimaryClassName =
  "ff-landing-cta-primary shadow-[0_4px_16px_rgba(37,99,235,0.26)] ring-1 ring-[rgba(37,99,235,0.12)]";

export const landingMobileCtaCardClassName = "ff-landing-cta-card";

export const landingMobilePricingHighlightClassName = "ff-landing-pricing-featured";

export const landingHeroMeshClassName =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_-10%,rgba(37,99,235,0.09),transparent_55%),radial-gradient(ellipse_50%_40%_at_10%_20%,rgba(37,99,235,0.04),transparent_50%)]";

export const landingSectionDividerClassName =
  "border-y border-[rgba(15,23,42,0.06)]";

export const landingSignatureHaloClassName = "ff-signature-halo";

export const landingSignatureGridClassName = "ff-signature-grid";

export const landingSignatureBeamClassName = "ff-signature-beam";

export const landingChipAccentClassName = "ff-signature-chip pl-3";

export const landingMockShadowClassName =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_8px_16px_rgba(15,23,42,0.05),0_28px_64px_rgba(15,23,42,0.11)]";

export const landingMockGlowClassName =
  "ff-signature-mock-glow ring-1 ring-[rgba(37,99,235,0.08)]";

export const landingMockHoverClassName =
  "transition-all duration-[220ms] ease-out hover:-translate-y-1 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_12px_24px_rgba(15,23,42,0.06),0_40px_88px_rgba(37,99,235,0.1)]";

export const landingMockStackClassName =
  "relative before:pointer-events-none before:absolute before:-inset-x-3 before:-bottom-3 before:top-6 before:-z-10 before:rounded-2xl before:border before:border-[rgba(37,99,235,0.06)] before:bg-white/60 before:shadow-[0_12px_40px_rgba(37,99,235,0.06)]";

export const landingSectionFadeClassName =
  "relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-[rgba(248,250,252,0.9)] before:to-transparent";

export const landingDarkVignetteClassName = "ff-signature-dark-vignette";

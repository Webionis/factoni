import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { LandingHeroVisual } from "@/components/marketing/landing-hero-visual";
import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import {
  LandingSignatureBackdrop,
  LandingSignatureBeam,
} from "@/components/marketing/landing-signature";
import { buttonVariants } from "@/components/ui/button";
import {
  landingHeroMeshClassName,
  landingMobileHeroTitleClassName,
  landingMobileCtaPrimaryClassName,
  landingMobileSectionStrongClassName,
  landingMobileStackGapClassName,
  landingMotionClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import { marketingEyebrowClassName, marketingTrustPillClassName } from "@/lib/constants/ui";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const HIGHLIGHTS_MOBILE = [
  "Devis & factures illimités",
  "Agenda & rendez-vous",
  "PDF pro · mentions conformes",
] as const;

const HIGHLIGHTS_DESKTOP = [
  "Devis, factures & agenda dans un seul outil",
  "Numéro légal FF-YYYY-NNNNNN à l'envoi",
  "PDF pro avec logo et mentions conformes",
  "Prêt pour la réforme facturation électronique 2026",
  "Hébergement Europe · données sauvegardées",
] as const;

export function LandingHero() {
  return (
    <section
      className={cn(
        landingSurface.hero,
        landingSectionXClassName,
        landingMobileSectionStrongClassName,
        "relative overflow-hidden pt-6 pb-8 md:pt-12 md:pb-16 lg:pb-20 lg:pt-16",
      )}
    >
      <LandingSignatureBackdrop />
      <div className={landingHeroMeshClassName} aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 ff-landing-hero-premium md:hidden"
        aria-hidden
      />
      <LandingSignatureBeam className="hidden md:block" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-48 ff-landing-glow md:block"
        aria-hidden
      />

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-6xl min-w-0 flex-col",
          landingMobileStackGapClassName,
          "lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-11 xl:gap-12",
        )}
      >
        <LandingScrollReveal className="order-1 min-w-0">
          <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
            <p className={marketingEyebrowClassName}>{siteConfig.name}</p>
            <h1 className={cn("mt-4", landingMobileHeroTitleClassName)}>
              {siteConfig.tagline}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-[1.65] text-[#64748b] md:mx-0 md:text-lg md:leading-relaxed">
              {siteConfig.subtagline}
            </p>

            <ul className="mx-auto mt-6 hidden max-w-sm space-y-3 md:mx-0 md:block md:max-w-none">
              {HIGHLIGHTS_DESKTOP.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-[15px] text-[#64748b]"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-[#2563eb]"
                    aria-hidden
                  />
                  {text}
                </li>
              ))}
            </ul>
            <ul className="mx-auto mt-5 flex max-w-xs flex-col gap-2.5 md:hidden">
              {HIGHLIGHTS_MOBILE.map((text) => (
                <li
                  key={text}
                  className="flex items-center justify-center gap-2.5 text-[15px] text-[#64748b]"
                >
                  <CheckCircle2
                    className="size-4 shrink-0 text-[#2563eb]"
                    aria-hidden
                  />
                  {text}
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-2.5 md:mx-0 md:mt-8 md:max-w-none md:flex-row md:items-center md:gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-[3.125rem] w-full px-7 text-[15px] font-semibold md:h-12 md:min-w-[15rem] md:w-auto",
                  landingMobileCtaPrimaryClassName,
                  landingMotionClassName,
                )}
              >
                Commencer maintenant
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-[3rem] w-full px-7 text-[15px] text-[#64748b] md:h-12 md:w-auto",
                  landingMotionClassName,
                  "active:scale-[0.99] md:hover:border-[rgba(37,99,235,0.2)] md:hover:text-[#0f172a]",
                )}
              >
                Se connecter
              </Link>
            </div>
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 md:mt-4 md:justify-start">
              {["Sans carte", "Hébergement EU", "PDF conforme"].map((pill) => (
                <span key={pill} className={marketingTrustPillClassName}>
                  {pill}
                </span>
              ))}
            </div>
            <p className="mt-3 text-center text-[12px] font-medium text-[#94a3b8] md:text-left md:text-xs">
              Offre de lancement · Accès anticipé
            </p>
          </div>
        </LandingScrollReveal>

        <LandingScrollReveal
          delayMs={90}
          className="order-2 w-full min-w-0 md:mt-0 lg:justify-self-end"
        >
          <LandingHeroVisual />
        </LandingScrollReveal>
      </div>
    </section>
  );
}

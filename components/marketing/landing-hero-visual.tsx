"use client";

import { Send } from "lucide-react";

import { LandingDashboardMock } from "@/components/marketing/landing-dashboard-mock";
import { LandingHeroMobileVisual } from "@/components/marketing/landing-mobile";
import { LandingFloatingChip } from "@/components/marketing/landing-floating-chip";
import { LandingMockFrame } from "@/components/marketing/landing-signature";
import { LandingParallax } from "@/components/marketing/landing-parallax";
import { landingSignatureHaloClassName } from "@/lib/constants/marketing-landing";
import { cn } from "@/lib/utils";

export function LandingHeroVisual() {
  return (
    <>
      {/* Mobile premium — mock simplifié pleine largeur */}
      <div className="relative w-full min-w-0 md:hidden">
        <div
          className="pointer-events-none absolute -inset-6 ff-landing-mock-hero-glow"
          aria-hidden
        />
        <div className="relative">
          <LandingHeroMobileVisual />
        </div>
      </div>

      {/* Desktop — mock détaillé + décor */}
      <LandingParallax
        disableBelow="md"
        className="relative mx-auto hidden w-full min-w-0 md:block md:max-w-xl lg:max-w-none lg:translate-x-3 xl:max-w-[36rem]"
      >
        <div
          className={cn(
            "pointer-events-none absolute -inset-12 opacity-90",
            landingSignatureHaloClassName,
          )}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-10 ff-landing-glow"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-16 ff-landing-mock-hero-glow"
          aria-hidden
        />

        <LandingFloatingChip className="absolute -top-3 right-0 z-30 max-w-[11.5rem] lg:-right-5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#eff6ff] text-[#2563eb]">
              <Send className="size-3.5" strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0f172a]">Facture envoyée</p>
              <p className="truncate text-xs text-[#64748b]">SARL Martin · 1 240 €</p>
            </div>
          </div>
        </LandingFloatingChip>

        <div className="relative z-10 ff-landing-float motion-reduce:animate-none">
          <LandingMockFrame className="w-full min-w-0">
            <LandingDashboardMock className="w-full min-w-0" />
          </LandingMockFrame>
        </div>
      </LandingParallax>
    </>
  );
}

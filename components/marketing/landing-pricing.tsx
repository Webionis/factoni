import Link from "next/link";
import { Check } from "lucide-react";

import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import { PUBLIC_PRICING_PLANS } from "@/lib/billing/plans";
import {
  landingMobileBodyClassName,
  landingMobileCtaPrimaryClassName,
  landingMobilePricingHighlightClassName,
  landingMobileSectionLightClassName,
  landingMotionClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import {
  marketingEyebrowClassName,
  marketingSectionLeadClassName,
  marketingSectionTitleClassName,
  premiumShadowClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const MOBILE_MAX_FEATURES = 4;

export function LandingPricing() {
  return (
    <section
      id="tarifs"
      className={cn(landingSurface.soft, landingMobileSectionLightClassName, landingSectionXClassName)}
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <LandingScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className={marketingEyebrowClassName}>Tarifs</p>
            <h2
              id="pricing-heading"
              className={cn(
                marketingSectionTitleClassName,
                "text-[1.75rem] md:text-[1.75rem]",
              )}
            >
              Des offres pensées pour chaque étape
            </h2>
            <p className={cn(marketingSectionLeadClassName, "mt-4 text-[15px] md:text-base")}>
              Tout est gratuit pendant la bêta. Aucun paiement aujourd&apos;hui.
            </p>
          </div>
        </LandingScrollReveal>

        <LandingScrollReveal delayMs={60} className="mt-8">
          <div className="w-full rounded-2xl border border-[rgba(37,99,235,0.14)] bg-[rgba(37,99,235,0.04)] px-5 py-5 text-center md:mx-auto md:max-w-3xl md:px-6 md:py-6">
            <p className="text-lg font-semibold text-[#0f172a]">Bêta gratuite en cours</p>
            <p className={cn("mt-2", landingMobileBodyClassName)}>
              Accès complet — aucune carte requise.
            </p>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "default" }),
                "mt-5 h-[3.25rem] w-full px-6 text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.2)] md:mt-4 md:h-10 md:w-auto",
              )}
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </LandingScrollReveal>

        <ul className="mt-10 flex w-full flex-col gap-5 md:mt-10 md:grid md:grid-cols-3 md:gap-5">
          {PUBLIC_PRICING_PLANS.map((plan, i) => (
            <LandingScrollReveal key={plan.id} delayMs={80 + i * 40} className="w-full">
              <li
                className={cn(
                  "ff-marketing-elevated-card ff-landing-card-lift flex h-full w-full min-w-0 flex-col rounded-2xl border p-5 md:p-7",
                  plan.highlighted
                    ? cn(
                        "border-[rgba(37,99,235,0.18)] ring-1 ring-[rgba(37,99,235,0.08)]",
                        "md:shadow-[0_4px_12px_rgba(15,23,42,0.04),0_24px_56px_rgba(37,99,235,0.1)]",
                        landingMobilePricingHighlightClassName,
                      )
                    : "border-[rgba(15,23,42,0.06)]",
                  !plan.highlighted && premiumShadowClassName,
                  landingMotionClassName,
                  "md:hover:border-[rgba(37,99,235,0.12)]",
                )}
              >
                {plan.highlighted ? (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-[rgba(37,99,235,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">
                    Recommandé
                  </span>
                ) : (
                  <span className="mb-4 block h-6" aria-hidden />
                )}
                <h3 className="text-lg font-semibold tracking-tight text-[#0f172a]">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-[15px] font-medium text-[#64748b]">{plan.tagline}</p>
                <div className="mt-5 flex flex-wrap items-baseline gap-1.5">
                  <span className="text-[1.75rem] font-semibold tracking-tight text-[#0f172a] md:text-3xl">
                    {plan.priceLabel}
                  </span>
                  {plan.priceSuffix ? (
                    <span className="text-[15px] font-medium text-[#94a3b8]">
                      {plan.priceSuffix}
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-3 hidden md:block", landingMobileBodyClassName)}>
                  {plan.description}
                </p>
                <ul
                  className="mt-6 flex-1 space-y-3.5"
                  aria-label={`Inclus ${plan.name}`}
                >
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-start gap-3 text-[15px] leading-[1.55] text-[#334155]",
                        featureIndex >= MOBILE_MAX_FEATURES && "hidden md:flex",
                      )}
                    >
                      <Check
                        className="mt-0.5 size-[1.125rem] shrink-0 text-[#2563eb]"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-center text-[15px] font-medium text-[#94a3b8] md:text-sm">
                  {plan.ctaLabel}
                </p>
              </li>
            </LandingScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Check } from "lucide-react";

import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import {
  getLandingPricingFooter,
  getLandingPricingLead,
  getPublicPricingPlans,
} from "@/lib/billing/plans";
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
      className={cn(
        landingSurface.soft,
        landingMobileSectionLightClassName,
        landingSectionXClassName,
      )}
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
              Deux offres, une facturation pro
            </h2>
            <p className={cn(marketingSectionLeadClassName, "mt-4 text-[15px] md:text-base")}>
              {getLandingPricingLead()}
            </p>
          </div>
        </LandingScrollReveal>

        <ul className="mx-auto mt-10 flex w-full min-w-0 max-w-[52rem] flex-col gap-5 sm:gap-6 md:mt-12 md:grid md:grid-cols-2 md:gap-6 lg:gap-8">
          {getPublicPricingPlans().map((plan, i) => (
            <LandingScrollReveal key={plan.id} delayMs={60 + i * 40} className="w-full min-w-0">
              <li
                className={cn(
                  "ff-marketing-elevated-card ff-landing-card-lift flex h-full w-full min-w-0 flex-col rounded-2xl border p-5 sm:p-6 md:p-7",
                  plan.highlighted
                    ? cn(
                        "border-[rgba(37,99,235,0.18)] ring-1 ring-[rgba(37,99,235,0.08)]",
                        "shadow-[0_4px_12px_rgba(15,23,42,0.04),0_24px_56px_rgba(37,99,235,0.08)]",
                        landingMobilePricingHighlightClassName,
                      )
                    : cn(
                        "border-[rgba(15,23,42,0.06)]",
                        premiumShadowClassName,
                      ),
                  landingMotionClassName,
                  "md:hover:border-[rgba(37,99,235,0.12)]",
                )}
              >
                <span
                  className={cn(
                    "mb-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                    plan.highlighted
                      ? "bg-[rgba(37,99,235,0.08)] text-[#2563eb]"
                      : "border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] text-[#64748b]",
                  )}
                >
                  {plan.badge}
                </span>

                <h3 className="text-lg font-semibold tracking-tight text-[#0f172a]">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-[15px] font-medium text-[#64748b]">
                  {plan.tagline}
                </p>

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
                        "flex min-w-0 items-start gap-3 text-[15px] leading-[1.55] text-[#334155]",
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

                <div className="mt-6 w-full min-w-0">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: plan.highlighted ? "default" : "outline" }),
                      "h-11 w-full text-[15px] font-semibold",
                      plan.highlighted && landingMobileCtaPrimaryClassName,
                      transitionPremiumClassName,
                    )}
                  >
                    {plan.ctaLabel}
                  </Link>
                  {plan.ctaFootnote ? (
                    <p className="mt-3 text-center text-xs leading-relaxed text-[#94a3b8] md:text-left">
                      {plan.ctaFootnote}
                    </p>
                  ) : null}
                </div>
              </li>
            </LandingScrollReveal>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs font-medium text-[#94a3b8]">
          {getLandingPricingFooter()}
        </p>
      </div>
    </section>
  );
}

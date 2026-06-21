import { pageMetadata } from "@/lib/metadata";
import {
  LandingBenefitsStrip,
  LandingFeaturesCta,
  LandingFeaturesEditorial,
} from "@/components/marketing/landing-features-editorial";
import { LandingDarkShowcase } from "@/components/marketing/landing-dark-showcase";
import {
  LandingFaq,
  LandingTestimonials,
} from "@/components/marketing/landing-extras";
import { LandingFinalCta } from "@/components/marketing/landing-final-cta";
import { LandingHero } from "@/components/marketing/landing-hero";
import { LandingPricing } from "@/components/marketing/landing-pricing";
import { LandingTrustStrip } from "@/components/marketing/landing-trust-strip";
import {
  getLandingFaq,
  getLandingTestimonialsLead,
} from "@/lib/billing/plans";
import { landingPageClassName } from "@/lib/constants/marketing-landing";

export const metadata = pageMetadata("home");

export default function HomePage() {
  return (
    <div className={landingPageClassName}>
      <LandingHero />
      <LandingTrustStrip />
      <LandingBenefitsStrip />
      <LandingDarkShowcase />
      <LandingFeaturesEditorial />
      <LandingFeaturesCta />
      <LandingTestimonials lead={getLandingTestimonialsLead()} />
      <LandingPricing />
      <LandingFaq items={getLandingFaq()} />
      <LandingFinalCta />
    </div>
  );
}

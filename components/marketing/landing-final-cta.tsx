import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import { LandingSignatureBackdrop } from "@/components/marketing/landing-signature";
import { buttonVariants } from "@/components/ui/button";
import {
  landingMobileBodyClassName,
  landingMobileCtaCardClassName,
  landingMobileCtaPrimaryClassName,
  landingMobileSectionStrongClassName,
  landingMotionClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import { marketingEyebrowClassName, marketingTrustPillClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const TRUST_POINTS_MOBILE = [
  "Offre de lancement — sans carte",
  "Mentions légales conformes",
  "Export comptable CSV",
] as const;

const TRUST_POINTS_DESKTOP = [
  "Configuration en moins d'une minute",
  "Offre de lancement — sans carte bancaire",
  "Numérotation légale automatique à l'envoi",
  "Hébergement Europe · sauvegardes automatiques",
] as const;

export function LandingFinalCta() {
  return (
    <section
      className={cn(
        landingSurface.blueTint,
        landingSectionXClassName,
        landingMobileSectionStrongClassName,
        "relative overflow-hidden",
      )}
      aria-labelledby="final-cta-heading"
    >
      <LandingSignatureBackdrop className="hidden opacity-60 md:block" />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl">
        <LandingScrollReveal>
          <div className="ff-marketing-elevated-card relative w-full overflow-hidden rounded-2xl border border-[rgba(37,99,235,0.16)] px-5 py-7 shadow-[0_4px_12px_rgba(15,23,42,0.04),0_28px_64px_rgba(37,99,235,0.1)] ring-1 ring-[rgba(37,99,235,0.08)] md:px-9 md:py-9 lg:p-11">
            <div className="relative mx-auto max-w-2xl text-center">
              <p className={marketingEyebrowClassName}>Prêt à passer à l&apos;action ?</p>
              <h2
                id="final-cta-heading"
                className="mt-4 text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.03em] text-[#0f172a] md:text-[2rem]"
              >
                Testez Factoni avec vos vrais clients
              </h2>
              <p className={cn("mx-auto mt-4 max-w-lg", landingMobileBodyClassName)}>
                Rejoignez les premiers pros qui facturent sans tableur.
              </p>

              <ul className="mx-auto mt-6 hidden max-w-md flex-col gap-3 text-left md:flex md:items-center">
                {TRUST_POINTS_DESKTOP.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2.5 text-[15px] text-[#64748b]"
                  >
                    <CheckCircle2
                      className="size-4 shrink-0 text-[#2563eb]"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <ul className="mx-auto mt-6 flex max-w-sm flex-col gap-3 md:hidden">
                {TRUST_POINTS_MOBILE.map((point) => (
                  <li
                    key={point}
                    className="flex items-center justify-center gap-2.5 text-[15px] text-[#64748b]"
                  >
                    <CheckCircle2
                      className="size-4 shrink-0 text-[#2563eb]"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-2.5 md:mt-8 md:max-w-none md:flex-row md:justify-center md:gap-3">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-[3.25rem] w-full px-6 text-[15px] md:min-w-[14rem] md:h-12 md:w-auto md:px-8",
                    landingMobileCtaPrimaryClassName,
                    landingMotionClassName,
                  )}
                >
                  Créer mon compte
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-[3.25rem] w-full px-6 text-[15px] md:h-12 md:w-auto md:px-8",
                    landingMotionClassName,
                    "active:scale-[0.99] md:hover:border-[rgba(37,99,235,0.22)]",
                  )}
                >
                  J&apos;ai déjà un compte
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {["Sans carte", "Export CSV", "Mentions légales"].map((pill) => (
                  <span key={pill} className={marketingTrustPillClassName}>
                    {pill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[12px] font-medium text-[#94a3b8] md:text-sm">
                Déjà utilisé par des artisans, consultants et TPE en accès anticipé
              </p>
            </div>
          </div>
        </LandingScrollReveal>
      </div>
    </section>
  );
}

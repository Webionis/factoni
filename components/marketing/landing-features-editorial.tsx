import Link from "next/link";
import { CheckCircle2, Shield, Smartphone } from "lucide-react";

import { LandingInvoiceListMock } from "@/components/marketing/landing-invoice-list-mock";
import {
  LandingInvoicesMobilePreview,
  LandingPdfMobilePreview,
} from "@/components/marketing/landing-mobile";
import { LandingPdfMock } from "@/components/marketing/landing-pdf-mock";
import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import { LandingMockFrame } from "@/components/marketing/landing-signature";
import {
  landingMobileBodyClassName,
  landingMobileSectionBreathClassName,
  landingMobileSectionCompactClassName,
  landingMobileSectionLightClassName,
  landingMobileStackGapClassName,
  landingMotionClassName,
  landingMobileTitleClassName,
  landingSectionDividerClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import {
  marketingEyebrowClassName,
  marketingFeatureCardClassName,
  marketingSectionLeadClassName,
  marketingSectionTitleClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const QUICK_BENEFITS = [
  { icon: Smartphone, title: "Mobile-first", desc: "Facturez sur chantier en quelques taps." },
  { icon: Shield, title: "Sécurisé", desc: "Données isolées par compte, hébergement EU." },
] as const;

function EditorialBlock({
  id,
  title,
  description,
  bullets,
  visualDesktop,
  mobilePreview,
  reverse,
  surface,
}: {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  visualDesktop: React.ReactNode;
  mobilePreview: React.ReactNode;
  reverse?: boolean;
  surface: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        surface,
        landingSectionDividerClassName,
        landingMobileSectionLightClassName,
        landingSectionXClassName,
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div
        className={cn(
          "mx-auto flex w-full min-w-0 max-w-6xl flex-col",
          landingMobileStackGapClassName,
          "lg:grid lg:grid-cols-2 lg:items-center lg:gap-14",
        )}
      >
        <LandingScrollReveal
          className={cn("min-w-0", reverse && "lg:order-2")}
          delayMs={reverse ? 60 : 0}
        >
          <div className={cn("w-full max-w-lg", reverse ? "lg:ml-auto" : "")}>
            <h2 id={`${id}-heading`} className={landingMobileTitleClassName}>
              {title}
            </h2>
            <p className={cn("mt-4 md:mt-4", landingMobileBodyClassName)}>
              <span className="md:hidden">{description.split(".")[0]}.</span>
              <span className="hidden md:inline">{description}</span>
            </p>
            <ul className="mt-6 space-y-3.5">
              {bullets.map((text, index) => (
                <li
                  key={text}
                  className={cn(
                    "flex gap-3 text-[15px] leading-[1.6] text-[#64748b]",
                    index >= 2 && "hidden md:flex",
                  )}
                >
                  <CheckCircle2
                    className="mt-0.5 size-[1.125rem] shrink-0 text-[#2563eb]"
                    aria-hidden
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </LandingScrollReveal>

        {/* Mobile : aperçu simplifié lisible */}
        <LandingScrollReveal
          className={cn("w-full min-w-0 md:hidden", reverse && "lg:order-1")}
          delayMs={reverse ? 0 : 40}
        >
          {mobilePreview}
        </LandingScrollReveal>

        {/* Desktop : mock détaillé */}
        <LandingScrollReveal
          className={cn("hidden justify-center md:flex", reverse && "lg:order-1")}
          delayMs={reverse ? 0 : 60}
        >
          <LandingMockFrame className="mx-auto w-full min-w-0 max-w-md">
            {visualDesktop}
          </LandingMockFrame>
        </LandingScrollReveal>
      </div>
    </section>
  );
}

export function LandingBenefitsStrip() {
  return (
    <section
      className={cn(
        landingSurface.white,
        landingMobileSectionCompactClassName,
        landingSectionXClassName,
      )}
      aria-label="Points forts"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-4">
        {QUICK_BENEFITS.map(({ icon: Icon, title, desc }, i) => (
          <LandingScrollReveal key={title} delayMs={i * 40}>
            <div
              className={cn(
                marketingFeatureCardClassName,
                "ff-landing-card-lift flex w-full gap-3.5 p-5 md:gap-4 md:p-8",
                landingMotionClassName,
              )}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] text-[#2563eb]">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-[#0f172a]">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[#64748b]">{desc}</p>
              </div>
            </div>
          </LandingScrollReveal>
        ))}
      </div>
    </section>
  );
}

export function LandingFeaturesEditorial() {
  return (
    <>
      <section
        className={cn(
          landingSurface.muted,
          landingMobileSectionCompactClassName,
          landingSectionXClassName,
        )}
        aria-labelledby="benefits-heading"
      >
        <div className="mx-auto max-w-6xl px-0 text-center">
          <LandingScrollReveal>
            <h2
              id="benefits-heading"
              className={cn(
                marketingSectionTitleClassName,
                "text-[1.75rem] md:text-[1.75rem]",
              )}
            >
              Conçu pour facturer sans friction
            </h2>
            <p className={cn(marketingSectionLeadClassName, "mt-4 text-[15px] md:text-base")}>
              Rapide sur mobile, conforme sur le terrain.
            </p>
          </LandingScrollReveal>
        </div>
      </section>

      <EditorialBlock
        id="factures"
        surface={landingSurface.white}
        title="Créez et suivez vos factures en quelques secondes"
        description="Clients, lignes, TVA et totaux dans un flux unique. Passez du brouillon à l'envoi avec numérotation légale automatique."
        bullets={[
          "Statuts clairs : brouillon, envoyée, payée, en retard",
          "Recherche par client, numéro ou notes",
          "Archivage propre pour garder un historique net",
        ]}
        mobilePreview={<LandingInvoicesMobilePreview />}
        visualDesktop={<LandingInvoiceListMock className="w-full" />}
      />

      <EditorialBlock
        id="pdf"
        reverse
        surface={landingSurface.soft}
        title="Un PDF qui rassure vos clients"
        description="Logo, coordonnées, lignes détaillées et totaux conformes — générés à partir de vos données figées à l'envoi."
        bullets={[
          "Mentions légales et franchise en base si applicable",
          "Export brouillon ou facture envoyée",
          "Prêt à envoyer par email en un clic",
        ]}
        mobilePreview={<LandingPdfMobilePreview />}
        visualDesktop={
          <div className="w-full min-w-0">
            <LandingPdfMock large className="mx-auto" />
          </div>
        }
      />
    </>
  );
}

export function LandingFeaturesCta() {
  return (
    <section
      className={cn(
        landingSurface.blueTint,
        landingSectionXClassName,
        landingMobileSectionBreathClassName,
        "md:pb-14 md:pt-2",
      )}
    >
      <LandingScrollReveal>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-0 text-center">
          <p className={marketingEyebrowClassName}>Offre de lancement</p>
          <p className="max-w-md text-[15px] leading-[1.65] text-[#64748b] md:text-[15px]">
            Rejoignez les premiers professionnels qui structurent leur facturation
            avec Factoni.
          </p>
          <Link
            href="/signup"
            className="mt-1 inline-flex min-h-11 items-center text-[15px] font-semibold text-[#2563eb] transition-all duration-[200ms] ease-out hover:opacity-80"
          >
            Créer mon compte →
          </Link>
        </div>
      </LandingScrollReveal>
    </section>
  );
}

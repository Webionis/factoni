import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingSignatureBeam } from "@/components/marketing/landing-signature";
import { LEGAL_ROUTES } from "@/lib/legal/urls";
import {
  landingMobileSectionLightClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import { transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/login", label: "Connexion" },
  { href: "/signup", label: "Créer un compte" },
  { href: LEGAL_ROUTES.mentionsLegales, label: "Mentions légales" },
  { href: LEGAL_ROUTES.cgu, label: "CGU" },
  { href: LEGAL_ROUTES.cgv, label: "CGV" },
  { href: LEGAL_ROUTES.confidentialite, label: "Confidentialité" },
] as const;

const TRUST_MARKS = [
  "Devis & factures",
  "Agenda intégré",
  "Export comptable",
  "Mentions conformes",
] as const;

export function MarketingFooter() {
  return (
    <footer
      className={cn(
        landingSurface.footer,
        "relative overflow-hidden border-t border-[rgba(15,23,42,0.06)]",
      )}
    >
      <LandingSignatureBeam className="hidden md:block" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[rgba(248,250,252,0.95)] to-transparent md:h-24 md:from-white/40"
        aria-hidden
      />

      <div
        className={cn(
          "relative mx-auto w-full max-w-6xl",
          landingMobileSectionLightClassName,
          landingSectionXClassName,
        )}
      >
        <div className="flex flex-col gap-10 md:grid md:grid-cols-[1.6fr_1fr] md:items-start md:gap-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className={cn(
                "inline-flex items-center",
                transitionPremiumClassName,
                "hover:opacity-90",
              )}
            >
              <BrandLogo variant="black" size="sm" />
            </Link>
            <p className="mt-3 text-[15px] font-medium tracking-wide text-[#94a3b8]">
              Facturation pro, simplifiée
            </p>
            <p className="mt-5 text-[15px] font-medium leading-[1.55] text-[#334155]">
              La facturation pro, sans la complexité.
            </p>
            <p className="mt-3 text-[15px] leading-[1.65] text-[#64748b]">
              Pensé pour artisans, indépendants et petites entreprises en France.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-[rgba(37,99,235,0.12)] bg-[rgba(37,99,235,0.05)] px-3.5 py-1.5 text-[15px] font-medium text-[#2563eb]">
              Offre de lancement · Accès anticipé
            </p>
          </div>

          <div className="md:pt-1 md:text-right">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
              Navigation
            </p>
            <nav
              className="mt-5 flex flex-col gap-4 md:mt-3 md:items-end md:gap-3"
              aria-label="Liens du pied de page"
            >
              {FOOTER_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex min-h-11 items-center text-[15px] font-medium text-[#64748b] md:min-h-0 md:text-[15px]",
                    transitionPremiumClassName,
                    "hover:text-[#0f172a]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-[rgba(15,23,42,0.08)] pt-8 md:mt-10 md:flex-row md:items-center md:justify-between">
          <p className="text-[15px] leading-relaxed text-[#94a3b8]">
            © {new Date().getFullYear()} Factoni — Tous droits réservés
          </p>
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px] font-medium leading-relaxed text-[#94a3b8]">
            {TRUST_MARKS.map((mark, i) => (
              <li key={mark} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-[#cbd5e1]" aria-hidden>
                    ·
                  </span>
                ) : null}
                {mark}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

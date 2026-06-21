import {
  CalendarDays,
  Cloud,
  FileCheck2,
  FileSpreadsheet,
  Hash,
  ShieldCheck,
  Server,
} from "lucide-react";

import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import {
  landingMobileSectionBreathClassName,
  landingMotionClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import { marketingTrustItemClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const TRUST_ITEMS = [
  {
    icon: FileCheck2,
    title: "Devis & factures",
    desc: "Création, envoi et suivi — Starter.",
  },
  {
    icon: CalendarDays,
    title: "Agenda intégré",
    desc: "Planifiez vos rendez-vous — Starter.",
  },
  {
    icon: FileCheck2,
    title: "Réforme 2026",
    desc: "PDF conforme · prêt pour la facturation électronique.",
  },
  {
    icon: Server,
    title: "Hébergement EU",
    desc: "Données hébergées en Europe, conformité RGPD.",
  },
  {
    icon: Cloud,
    title: "Sauvegardes auto",
    desc: "Vos factures et clients conservés en continu.",
  },
  {
    icon: ShieldCheck,
    title: "Données isolées",
    desc: "Chaque compte est protégé par authentification et RLS.",
  },
  {
    icon: Hash,
    title: "Numérotation légale",
    desc: "Numéro FF-YYYY-NNNNNN attribué à l'envoi — Starter.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export comptable",
    desc: "Export CSV factures & devis — Starter.",
  },
] as const;

export function LandingTrustStrip() {
  return (
    <section
      className={cn(
        landingSurface.muted,
        landingMobileSectionBreathClassName,
        landingSectionXClassName,
        "border-y border-[rgba(15,23,42,0.05)]",
      )}
      aria-label="Garanties métier et conformité"
    >
      <div className="mx-auto w-full max-w-6xl">
        <LandingScrollReveal>
          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
            Conçu pour les pros en France
          </p>
        </LandingScrollReveal>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 md:mt-6 md:grid-cols-3 md:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title}>
              <LandingScrollReveal delayMs={i * 30}>
                <div
                  className={cn(
                    marketingTrustItemClassName,
                    landingMotionClassName,
                    "ff-landing-card-lift h-full",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(37,99,235,0.08)] text-[#2563eb] md:size-10">
                    <Icon className="size-4 md:size-[1.125rem]" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-tight text-[#0f172a] md:text-sm">
                      {title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-[1.5] text-[#64748b] md:text-[13px] md:leading-snug">
                      {desc}
                    </p>
                  </div>
                </div>
              </LandingScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

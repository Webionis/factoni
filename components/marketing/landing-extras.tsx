"use client";

import { ChevronDown } from "lucide-react";

import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import {
  landingMobileBodyClassName,
  landingMobileSectionLightClassName,
  landingSectionXClassName,
  landingSurface,
} from "@/lib/constants/marketing-landing";
import {
  marketingFaqItemClassName,
  marketingSectionLeadClassName,
  marketingSectionTitleClassName,
  marketingTestimonialCardClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    quote:
      "Je fais mes devis directement depuis le chantier. Mes clients reçoivent un PDF propre le soir même.",
    author: "Marc D.",
    role: "Électricien",
    location: "Lyon",
    initials: "MD",
  },
  {
    quote:
      "Je relance mes clients en 2 clics. Plus besoin de courir après les paiements par SMS.",
    author: "Sophie L.",
    role: "Consultante RH",
    location: "Bordeaux",
    initials: "SL",
  },
  {
    quote:
      "Mes factures sont prêtes avant de quitter le chantier. Le numéro légal s'ajoute tout seul à l'envoi.",
    author: "Karim B.",
    role: "Plombier",
    location: "Marseille",
    initials: "KB",
  },
];

const FAQ = [
  {
    q: "Quels sont les tarifs ?",
    a: "Starter à 19 €/mois et Pro à 39 €/mois. Pendant l'offre de lancement, le plan Pro est offert aux membres fondateurs — accès anticipé, sans carte bancaire.",
  },
  {
    q: "Factoni est-il prêt pour la facturation électronique 2026 ?",
    a: "Factoni structure vos factures avec numérotation légale, mentions conformes et export comptable — les briques essentielles pour accompagner la réforme. Les évolutions réglementaires seront intégrées au fil de la mise en conformité.",
  },
  {
    q: "Puis-je facturer depuis mon téléphone ?",
    a: "Oui. L'interface est pensée mobile-first : clients, lignes, TVA et PDF en quelques taps, même sur chantier.",
  },
  {
    q: "Quand obtient-on le numéro de facture légal ?",
    a: "Au passage au statut « Envoyée ». En brouillon, la facture n'a pas de numéro FF-YYYY-NNNNNN.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "En Europe, via une infrastructure cloud sécurisée. Chaque compte est isolé : authentification Supabase, RLS sur chaque table, logos en bucket privé.",
  },
  {
    q: "Puis-je exporter mes factures pour mon comptable ?",
    a: "Oui. Export CSV de vos factures disponible depuis les réglages, pour faciliter le suivi comptable.",
  },
];

function TestimonialAvatar({ initials }: { initials: string }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(37,99,235,0.08)] text-[13px] font-semibold tracking-tight text-[#2563eb]"
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function LandingTestimonials() {
  return (
    <section
      className={cn(landingSurface.muted, landingMobileSectionLightClassName, landingSectionXClassName)}
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto w-full max-w-5xl">
        <LandingScrollReveal>
          <h2
            id="testimonials-heading"
            className={cn(
              marketingSectionTitleClassName,
              "text-[1.625rem] md:text-[1.75rem]",
            )}
          >
            Ils facturent déjà avec Factoni
          </h2>
          <p className={cn(marketingSectionLeadClassName, "text-[15px] md:text-base")}>
            Artisans et indépendants en accès anticipé — noms modifiés.
          </p>
        </LandingScrollReveal>
        <ul className="mt-7 flex w-full flex-col gap-3.5 md:mt-12 md:grid md:grid-cols-3 md:gap-4">
          {TESTIMONIALS.map((t, i) => (
            <li key={t.author} className="w-full">
              <LandingScrollReveal delayMs={i * 50} className="h-full w-full">
                <div
                  className={cn(
                    marketingTestimonialCardClassName,
                    "ff-landing-card-lift h-full w-full p-5 md:p-6",
                  )}
                >
                  <blockquote className="flex-1 text-[15px] leading-[1.6] text-[#334155] text-pretty">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer className="mt-5 flex items-center gap-3 border-t border-[rgba(15,23,42,0.06)] pt-4">
                    <TestimonialAvatar initials={t.initials} />
                    <div className="min-w-0">
                      <cite className="text-[14px] font-semibold not-italic text-[#0f172a]">
                        {t.author}
                      </cite>
                      <p className="mt-0.5 text-[13px] text-[#94a3b8]">
                        {t.role} · {t.location}
                      </p>
                    </div>
                  </footer>
                </div>
              </LandingScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingFaq() {
  return (
    <section
      className={cn(landingSurface.white, landingMobileSectionLightClassName, landingSectionXClassName)}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto w-full max-w-2xl">
        <LandingScrollReveal>
          <h2
            id="faq-heading"
            className={cn(
              marketingSectionTitleClassName,
              "text-[1.625rem] md:text-[1.75rem]",
            )}
          >
            Questions fréquentes
          </h2>
        </LandingScrollReveal>
        <div className="mt-7 w-full space-y-2.5 md:mt-10 md:space-y-3" role="list">
          {FAQ.map((item, i) => (
            <LandingScrollReveal key={item.q} delayMs={i * 30} className="w-full">
              <details
                className={cn(
                  marketingFaqItemClassName,
                  "ff-landing-card-lift w-full",
                )}
              >
                <summary
                  className={cn(
                    "flex min-h-[3rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium leading-snug text-[#0f172a] marker:content-none md:min-h-0 md:px-5 md:py-3.5 [&::-webkit-details-marker]:hidden",
                    transitionPremiumClassName,
                    "hover:text-[#2563eb] group-open:pb-2",
                  )}
                >
                  <span className="min-w-0 flex-1 text-left">{item.q}</span>
                  <ChevronDown
                    className="size-5 shrink-0 text-[#94a3b8] transition-transform duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-180 group-open:text-[#2563eb]"
                    aria-hidden
                  />
                </summary>
                <dd className="border-t border-[rgba(15,23,42,0.06)] px-4 pb-4 pt-0 md:px-5 md:pb-4">
                  <p className={cn("pt-3", landingMobileBodyClassName)}>{item.a}</p>
                </dd>
              </details>
            </LandingScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { LandingLivePulse } from "@/components/marketing/landing-live-pulse";
import {
  LandingDarkMobileActivity,
  LandingDarkMobileKpis,
} from "@/components/marketing/landing-mobile";
import { LandingScrollReveal } from "@/components/marketing/landing-scroll-reveal";
import { LandingSignatureBackdrop } from "@/components/marketing/landing-signature";
import {
  landingDarkVignetteClassName,
  landingMobileBodyClassName,
  landingMobileSectionStrongClassName,
  landingMobileStackGapClassName,
  landingSectionXClassName,
} from "@/lib/constants/marketing-landing";
import { transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const METRICS_DESKTOP = [
  { label: "CA TTC ce mois", value: "8 420 €", delta: "+12 % vs mois dernier" },
  { label: "Factures actives", value: "24", delta: "6 envoyées ce mois" },
  { label: "En retard", value: "1", delta: "Relance en 1 clic" },
] as const;

const ROWS_DESKTOP = [
  {
    ref: "FF-2026-000042",
    client: "SARL Martin",
    amount: "1 240,00 €",
    status: "Payée",
    time: "Il y a 2 h",
  },
  {
    ref: "FF-2026-000041",
    client: "Dupont Électricité",
    amount: "680,00 €",
    status: "Envoyée",
    time: "Hier",
  },
  {
    ref: "FF-2026-000038",
    client: "Atelier Bois",
    amount: "2 150,00 €",
    status: "En retard",
    time: "Il y a 4 j",
  },
] as const;

function statusStyles(status: string) {
  if (status === "Payée") return "bg-[#14532d]/50 text-[#86efac] ring-1 ring-[#86efac]/25";
  if (status === "Envoyée") return "bg-[#1e3a8a]/55 text-[#93c5fd] ring-1 ring-[#93c5fd]/20";
  return "bg-[#78350f]/45 text-[#fcd34d] ring-1 ring-[#fcd34d]/18";
}

export function LandingDarkShowcase() {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        landingMobileSectionStrongClassName,
        landingSectionXClassName,
        landingDarkVignetteClassName,
      )}
      aria-labelledby="dark-showcase-heading"
      style={{
        background:
          "linear-gradient(172deg, #080f1a 0%, #0f172a 32%, #152238 68%, #1e3a5f 100%)",
      }}
    >
      <LandingSignatureBackdrop variant="dark" />
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.32), transparent 62%), radial-gradient(ellipse 35% 28% at 0% 60%, rgba(37,99,235,0.1), transparent 55%), radial-gradient(ellipse 30% 25% at 100% 40%, rgba(96,165,250,0.08), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 ff-landing-dark-cinematic md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080f1a]/80 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl">
        {/* ——— Mobile : KPI + 2 lignes lisibles ——— */}
        <div className={cn("md:hidden", landingMobileStackGapClassName)}>
          <LandingScrollReveal>
            <div className="text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#93c5fd]">
                Pilotage en temps réel
              </p>
              <h2
                id="dark-showcase-heading"
                className="mt-4 text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.025em] text-white sm:text-[2rem]"
              >
                Votre activité, lisible en un regard
              </h2>
              <p className="mt-4 text-center text-[15px] leading-[1.65] text-[#94a3b8]">
                Pilotez votre activité depuis votre iPhone.
              </p>
            </div>
          </LandingScrollReveal>

          <LandingScrollReveal delayMs={50}>
            <LandingDarkMobileKpis />
          </LandingScrollReveal>

          <LandingScrollReveal delayMs={100}>
            <LandingDarkMobileActivity />
          </LandingScrollReveal>
        </div>

        {/* ——— Desktop : version complète inchangée ——— */}
        <div className="hidden md:block">
          <LandingScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#93c5fd]">
                Pilotage en temps réel
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-white lg:text-[1.875rem]">
                Votre activité, lisible en un regard
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#94a3b8]">
                CA mensuel, statuts, relances et dernières factures — le tableau de
                bord conçu pour les pros sur le terrain.
              </p>
            </div>
          </LandingScrollReveal>

          <LandingScrollReveal delayMs={60} className="mt-9">
            <div className="grid grid-cols-3 gap-4">
              {METRICS_DESKTOP.map((m) => (
                <div
                  key={m.label}
                  className={cn(
                    "rounded-2xl border border-white/[0.14] bg-white/[0.08] p-5",
                    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_48px_rgba(0,0,0,0.28)]",
                    "backdrop-blur-md",
                    transitionPremiumClassName,
                    "hover:border-white/22 hover:bg-white/[0.11]",
                  )}
                >
                  <p className="text-xs font-medium text-[#94a3b8]">{m.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-white">
                    {m.value}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-[#93c5fd]">{m.delta}</p>
                </div>
              ))}
            </div>
          </LandingScrollReveal>

          <LandingScrollReveal delayMs={120} className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
                <p className="text-sm font-semibold text-white">Activité récente</p>
                <LandingLivePulse />
              </div>
              <ul className="divide-y divide-white/[0.08]">
                {ROWS_DESKTOP.map((row) => (
                  <li
                    key={row.ref}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5",
                      transitionPremiumClassName,
                      "hover:bg-white/[0.06]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-white">{row.ref}</p>
                      <p className="text-xs text-[#94a3b8]">
                        {row.client} · {row.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold tabular-nums text-white">
                        {row.amount}
                      </p>
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[10px] font-semibold",
                          statusStyles(row.status),
                        )}
                      >
                        {row.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </LandingScrollReveal>
        </div>
      </div>
    </section>
  );
}

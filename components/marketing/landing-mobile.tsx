import { FileCheck, FileText, TrendingUp } from "lucide-react";

import {
  landingMobileBodyClassName,
  landingMobileCardTitleClassName,
  landingMobileDarkKpiClassName,
  landingMobileDarkPanelClassName,
  landingMobileFeatureCardClassName,
  landingMobileMockClassName,
  landingMotionClassName,
} from "@/lib/constants/marketing-landing";
import { premiumBorderClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const LANDING_DARK_MOBILE_KPIS = [
  { label: "CA ce mois", value: "8 420 €" },
  { label: "Factures actives", value: "24" },
  { label: "En retard", value: "1" },
] as const;

export const LANDING_DARK_MOBILE_ACTIVITY = [
  {
    ref: "FF-2026-000042",
    client: "SARL Martin",
    amount: "1 240,00 €",
    status: "Payée",
    statusClass: "bg-[#14532d]/55 text-[#86efac] ring-1 ring-[#86efac]/30",
  },
  {
    ref: "FF-2026-000041",
    client: "Dupont Électricité",
    amount: "680,00 €",
    status: "Envoyée",
    statusClass: "bg-[#1e3a8a]/60 text-[#93c5fd] ring-1 ring-[#93c5fd]/25",
  },
] as const;

export function LandingDarkMobileKpis() {
  return (
    <ul className="flex w-full flex-col gap-3.5" aria-label="Indicateurs clés">
      {LANDING_DARK_MOBILE_KPIS.map((m) => (
        <li
          key={m.label}
          className={cn(
            landingMobileDarkKpiClassName,
            "w-full rounded-2xl border border-white/[0.16] bg-white/[0.09] px-6 py-6 backdrop-blur-md",
          )}
        >
          <p className="text-[15px] font-medium text-[#94a3b8]">{m.label}</p>
          <p className="mt-3 text-[2rem] font-semibold tabular-nums leading-none tracking-tight text-white">
            {m.value}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function LandingDarkMobileActivity() {
  return (
    <div
      className={cn(
        landingMobileDarkPanelClassName,
        "w-full rounded-2xl border border-white/[0.14] bg-white/[0.07] px-6 py-6",
      )}
    >
      <p className="text-[15px] font-semibold tracking-tight text-white">Activité récente</p>
      <ul className="mt-4 space-y-3.5">
        {LANDING_DARK_MOBILE_ACTIVITY.map((row) => (
          <li
            key={row.ref}
            className={cn(
              "rounded-xl border border-white/[0.1] bg-white/[0.05] px-5 py-5",
              landingMotionClassName,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[15px] font-semibold text-white">{row.ref}</p>
                <p className="mt-1 text-[15px] leading-snug text-[#94a3b8]">{row.client}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[15px] font-semibold",
                  row.statusClass,
                )}
              >
                {row.status}
              </span>
            </div>
            <p className="mt-3.5 text-xl font-semibold tabular-nums tracking-tight text-white">
              {row.amount}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingHeroMobileVisual() {
  const stats = [
    { icon: TrendingUp, label: "CA ce mois", value: "8 420 €" },
    { icon: FileText, label: "Factures", value: "24" },
  ] as const;

  return (
    <div className={cn(landingMobileMockClassName, premiumBorderClassName)} aria-hidden>
      <div className="border-b border-[rgba(15,23,42,0.06)] bg-gradient-to-b from-[#fcfcfd] to-[#f8fafc] px-6 py-5">
        <p className="text-[15px] font-medium text-[#64748b]">Tableau de bord</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-[#0f172a]">Bonjour Marc</p>
      </div>
      <div className="space-y-3.5 p-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl bg-[#f8fafc] px-5 py-[1.125rem] ring-1 ring-inset ring-[rgba(15,23,42,0.04)]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[rgba(37,99,235,0.12)] to-[rgba(37,99,235,0.06)] text-[#2563eb]">
              <Icon className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-[15px] font-medium text-[#64748b]">{label}</p>
              <p className="text-[1.625rem] font-semibold tabular-nums leading-none tracking-tight text-[#0f172a]">
                {value}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl border border-[rgba(37,99,235,0.14)] bg-gradient-to-r from-[rgba(37,99,235,0.08)] to-[rgba(37,99,235,0.04)] px-5 py-4">
          <p className="text-[15px] font-medium text-[#2563eb]">Dernière facture envoyée</p>
          <p className="text-lg font-semibold tabular-nums text-[#0f172a]">1 240 €</p>
        </div>
      </div>
    </div>
  );
}

export function LandingInvoicesMobilePreview() {
  return (
    <div className={landingMobileFeatureCardClassName} aria-hidden>
      <p className={landingMobileCardTitleClassName}>Facture pro en un clic</p>
      <p className={cn("mt-2.5", landingMobileBodyClassName)}>
        Numérotation légale et statuts clairs.
      </p>
      <div
        className={cn(
          landingMobileMockClassName,
          "mt-5 rounded-xl",
          premiumBorderClassName,
        )}
      >
        <div className="border-b border-[rgba(15,23,42,0.06)] bg-gradient-to-b from-[#f8fafc] to-white px-5 py-4">
          <p className="font-mono text-[15px] font-semibold text-[#0f172a]">FF-2026-000042</p>
          <p className="mt-1 text-[15px] text-[#64748b]">SARL Martin</p>
        </div>
        <div className="flex items-center justify-between px-5 py-6">
          <div>
            <p className="text-[15px] font-medium text-[#64748b]">Total TTC</p>
            <p className="mt-1 text-[1.75rem] font-semibold tabular-nums leading-none text-[#0f172a]">
              1 240,00 €
            </p>
          </div>
          <span className="rounded-lg bg-[#f0fdf4] px-4 py-2.5 text-[15px] font-semibold text-[#15803d] ring-1 ring-inset ring-[#86efac]/25">
            Payée
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPdfMobilePreview() {
  return (
    <div className={landingMobileFeatureCardClassName} aria-hidden>
      <p className={landingMobileCardTitleClassName}>PDF qui rassure</p>
      <p className={cn("mt-2.5", landingMobileBodyClassName)}>
        Logo, mentions légales et totaux conformes.
      </p>
      <div
        className={cn(
          landingMobileMockClassName,
          "relative mt-5 rounded-xl",
          premiumBorderClassName,
        )}
      >
        <div className="bg-gradient-to-r from-[#3478ff] to-[#2563eb] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              FF
            </span>
            <div>
              <p className="text-[15px] font-semibold text-white">Élec. Martin SARL</p>
              <p className="text-sm text-white/85">Facture</p>
            </div>
          </div>
        </div>
        <div className="space-y-3.5 px-5 py-6">
          <p className="font-mono text-lg font-bold tracking-tight text-[#0f172a]">
            FF-2026-000042
          </p>
          <div className="h-2.5 rounded-full bg-[#f1f5f9]" />
          <div className="h-2.5 w-[85%] rounded-full bg-[#f1f5f9]" />
          <div className="mt-3 flex items-end justify-between border-t border-[rgba(15,23,42,0.08)] pt-5">
            <p className="text-[15px] font-medium text-[#64748b]">Total TTC</p>
            <p className="text-[1.75rem] font-semibold tabular-nums leading-none text-[#0f172a]">
              1 240,00 €
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-[4.5rem] flex size-10 items-center justify-center rounded-full bg-[#f0fdf4] text-[#16a34a] shadow-[0_2px_8px_rgba(22,163,74,0.2)] ring-2 ring-white">
          <FileCheck className="size-5" strokeWidth={2.5} aria-hidden />
        </div>
      </div>
    </div>
  );
}

import {
  landingMockGlowClassName,
  landingMockShadowClassName,
} from "@/lib/constants/marketing-landing";
import { premiumBorderClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const KPIS = [
  { label: "Factures", value: "24" },
  { label: "CA TTC", value: "8 420 €" },
  { label: "Brouillons", value: "3" },
  { label: "En retard", value: "1" },
] as const;

const ACTIVITY = [
  {
    id: "FF-2026-000042",
    client: "SARL Martin",
    amount: "1 240,00 €",
    status: "Payée",
    statusClass: "bg-[#f0fdf4] text-[#15803d] ring-1 ring-[#86efac]/20",
  },
  {
    id: "FF-2026-000041",
    client: "Dupont Élec.",
    amount: "680,00 €",
    status: "Envoyée",
    statusClass: "bg-[#eff6ff] text-[#2563eb] ring-1 ring-[#93c5fd]/25",
  },
  {
    id: "FF-2026-000038",
    client: "Atelier Bois",
    amount: "2 150,00 €",
    status: "En retard",
    statusClass: "bg-[#fffbeb] text-[#b45309] ring-1 ring-[#fcd34d]/20",
  },
] as const;

export function LandingDashboardMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white",
        premiumBorderClassName,
        landingMockShadowClassName,
        landingMockGlowClassName,
        className,
      )}
      aria-hidden
    >
      <div className="border-b border-[rgba(15,23,42,0.06)] bg-gradient-to-b from-[#fcfcfd] to-[#f8fafc] px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-[#94a3b8]">Tableau de bord</p>
            <p className="text-sm font-semibold tracking-tight text-[#0f172a]">
              Bonjour Marc
            </p>
          </div>
          <span className="rounded-full border border-[rgba(37,99,235,0.14)] bg-[rgba(37,99,235,0.07)] px-2.5 py-0.5 text-[10px] font-semibold text-[#2563eb] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
            Pro
          </span>
        </div>
      </div>

      <div className="space-y-3 p-3 sm:space-y-3.5 sm:p-5">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] sm:p-3"
            >
              <p className="text-[10px] font-medium text-[#64748b]">{kpi.label}</p>
              <p className="mt-1 text-sm font-semibold tabular-nums tracking-tight text-[#0f172a]">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[rgba(15,23,42,0.06)] bg-white p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          <p className="mb-2.5 text-xs font-semibold text-[#0f172a]">CA TTC — 6 mois</p>
          <div className="flex h-16 items-end justify-between gap-1 px-0.5 sm:h-[4.5rem] sm:gap-1.5">
            {[32, 48, 40, 65, 55, 72].map((h, i) => (
              <div
                key={i}
                className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-[#3478ff] to-[#2563eb] shadow-[0_-1px_0_0_rgba(255,255,255,0.2)_inset]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.06)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)]">
          <p className="border-b border-[rgba(15,23,42,0.06)] bg-[#fafbfc] px-3 py-2 text-xs font-semibold text-[#0f172a]">
            Activité récente
          </p>
          <ul className="divide-y divide-[rgba(15,23,42,0.05)]">
            {ACTIVITY.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 transition-colors duration-[200ms] ease-out hover:bg-[#f8fafc]"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] font-semibold text-[#0f172a]">
                    {row.id}
                  </p>
                  <p className="truncate text-[10px] text-[#64748b]">{row.client}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold tabular-nums text-[#0f172a]">
                    {row.amount}
                  </p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                      row.statusClass,
                    )}
                  >
                    {row.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

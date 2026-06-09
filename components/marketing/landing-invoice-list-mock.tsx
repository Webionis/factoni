import {
  landingMockGlowClassName,
  landingMockShadowClassName,
} from "@/lib/constants/marketing-landing";
import { premiumBorderClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const INVOICES = [
  {
    id: "FF-2026-000042",
    client: "SARL Martin",
    date: "28 mai 2026",
    amount: "1 240,00 €",
    status: "Payée",
    pill: "bg-[#f0fdf4] text-[#15803d]",
  },
  {
    id: "FF-2026-000041",
    client: "Dupont Électricité",
    date: "26 mai 2026",
    amount: "680,00 €",
    status: "Envoyée",
    pill: "bg-[#eff6ff] text-[#2563eb]",
  },
  {
    id: "Brouillon",
    client: "Atelier Bois",
    date: "25 mai 2026",
    amount: "2 150,00 €",
    status: "Brouillon",
    pill: "bg-[#f1f5f9] text-[#64748b]",
  },
] as const;

export function LandingInvoiceListMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white",
        premiumBorderClassName,
        landingMockShadowClassName,
        "ring-1 ring-[rgba(15,23,42,0.04)]",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] bg-gradient-to-b from-[#fcfcfd] to-white px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:px-5">
        <p className="text-sm font-semibold text-[#0f172a]">Factures</p>
        <span className="rounded-lg bg-[#2563eb] px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
          + Nouvelle
        </span>
      </div>
      <ul className="divide-y divide-[rgba(15,23,42,0.05)] p-2">
        {INVOICES.map((inv) => (
          <li
            key={inv.id + inv.client}
            className="rounded-xl px-3 py-3 transition-colors duration-[200ms] ease-out hover:bg-[#f8fafc]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-[#0f172a]">
                  {inv.id}
                </p>
                <p className="mt-0.5 truncate text-sm text-[#64748b]">
                  {inv.client}
                </p>
                <p className="mt-1 text-[10px] text-[#94a3b8]">{inv.date}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-[#0f172a]">
                  {inv.amount}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                    inv.pill,
                  )}
                >
                  {inv.status}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import {
  landingMockGlowClassName,
  landingMockShadowClassName,
} from "@/lib/constants/marketing-landing";
import { premiumBorderClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface LandingPdfMockProps {
  large?: boolean;
  className?: string;
}

export function LandingPdfMock({ large, className }: LandingPdfMockProps) {
  return (
    <div className={cn("relative w-full", large ? "max-w-lg" : "max-w-md", className)}>
      <div
        className="pointer-events-none absolute -inset-4 rounded-[1.75rem] bg-gradient-to-b from-[#2563eb]/8 to-transparent opacity-80"
        aria-hidden
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white",
          premiumBorderClassName,
          landingMockShadowClassName,
          landingMockGlowClassName,
        )}
        aria-hidden
      >
        <div className="border-b border-[rgba(15,23,42,0.06)] bg-gradient-to-b from-[#f8fafc] to-[#fcfcfd] px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] text-xs font-bold text-[#2563eb]">
                FF
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Élec. Martin SARL</p>
                <p className="text-[11px] text-[#64748b]">12 rue des Artisans · Lyon</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                Facture
              </p>
              <p className="font-mono text-sm font-bold text-[#0f172a]">FF-2026-000042</p>
              <p className="mt-1 text-[10px] text-[#64748b]">Émise le 28/05/2026</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="font-semibold text-[#94a3b8]">Client</p>
              <p className="mt-1 font-medium text-[#0f172a]">SARL Martin</p>
              <p className="text-[#64748b]">contact@sarlmartin.fr</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#94a3b8]">Échéance</p>
              <p className="mt-1 font-medium text-[#0f172a]">27/06/2026</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-12 gap-1 border-b border-[rgba(15,23,42,0.06)] bg-[#f8fafc] px-3 py-2 text-[9px] font-semibold uppercase tracking-wide text-[#64748b]">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qté</span>
              <span className="col-span-2 text-right">TVA</span>
              <span className="col-span-2 text-right">TTC</span>
            </div>
            {[
              { desc: "Installation tableau électrique", qty: "1", vat: "20 %", ttc: "840,00 €" },
              { desc: "Déplacement & main d'œuvre", qty: "2", vat: "20 %", ttc: "400,00 €" },
            ].map((row) => (
              <div
                key={row.desc}
                className="grid grid-cols-12 gap-1 border-b border-[rgba(15,23,42,0.04)] px-3 py-2.5 text-[10px] last:border-0"
              >
                <span className="col-span-6 text-[#334155]">{row.desc}</span>
                <span className="col-span-2 text-right text-[#64748b]">{row.qty}</span>
                <span className="col-span-2 text-right text-[#64748b]">{row.vat}</span>
                <span className="col-span-2 text-right font-semibold text-[#0f172a]">
                  {row.ttc}
                </span>
              </div>
            ))}
          </div>
          <div className="ml-auto w-44 space-y-1 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] p-3 text-[10px]">
            <div className="flex justify-between text-[#64748b]">
              <span>Total HT</span>
              <span>1 033,33 €</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>TVA</span>
              <span>206,67 €</span>
            </div>
            <div className="flex justify-between border-t border-[rgba(15,23,42,0.08)] pt-2 font-semibold text-[#0f172a]">
              <span>Total TTC</span>
              <span>1 240,00 €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

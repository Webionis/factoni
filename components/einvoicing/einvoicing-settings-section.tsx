import { Send } from "lucide-react";

import {
  EinvoicingReadinessList,
  EinvoicingTimeline,
} from "@/components/einvoicing/einvoicing-readiness";
import { surfaceCardClassName } from "@/lib/constants/ui";
import type { EinvoicingReadinessReport } from "@/lib/e-invoicing/types";
import { EINVOICING_EMISSION_DEADLINE_LABEL } from "@/lib/e-invoicing/types";
import { cn } from "@/lib/utils";

interface EinvoicingSettingsSectionProps {
  companyReport: EinvoicingReadinessReport;
  platformPaEnabled: boolean;
}

export function EinvoicingSettingsSection({
  companyReport,
  platformPaEnabled,
}: EinvoicingSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <section className={cn(surfaceCardClassName, "space-y-5 p-6 sm:p-7")}>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.14)]">
            <Send className="size-5 text-[#2563eb] dark:text-[#93c5fd]" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold tracking-tight">
              Plateforme Agréée intégrée
            </h2>
            <p className="text-sm text-muted-foreground">
              À partir du {EINVOICING_EMISSION_DEADLINE_LABEL}, vos factures B2B
              sont transmises automatiquement par Factoni — sans démarche de
              votre côté.
            </p>
          </div>
        </div>

        {platformPaEnabled ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-100">
            Lorsque vous envoyez une facture à un client professionnel, Factoni
            génère le Factur-X et le transmet à la Plateforme Agréée en arrière-plan.
          </p>
        ) : (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            La connexion PA est en cours d&apos;activation côté Factoni. En
            attendant, vos factures Factur-X restent téléchargeables depuis
            chaque facture envoyée.
          </p>
        )}
      </section>

      <section className={cn(surfaceCardClassName, "space-y-4 p-6 sm:p-7")}>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Calendrier réglementaire
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dates clés de la réforme de facturation électronique en France.
          </p>
        </div>
        <EinvoicingTimeline />
      </section>

      <section className={cn(surfaceCardClassName, "space-y-4 p-6 sm:p-7")}>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Checklist de préparation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez que votre entreprise et vos clients professionnels sont
            prêts.
          </p>
        </div>
        <EinvoicingReadinessList items={companyReport.items} />
      </section>
    </div>
  );
}

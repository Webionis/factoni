import Link from "next/link";

import { EinvoicingReadinessList } from "@/components/einvoicing/einvoicing-readiness";
import { RetryEinvoicingTransmissionButton } from "@/components/einvoicing/retry-einvoicing-transmission-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EinvoicingReadinessReport } from "@/lib/e-invoicing/types";
import type { InvoiceEinvoicingTransmission } from "@/lib/data/einvoicing";

interface InvoiceEinvoicingCardProps {
  invoiceId: string;
  report: EinvoicingReadinessReport;
  latestTransmission: InvoiceEinvoicingTransmission | null;
  platformPaEnabled: boolean;
}

function transmissionLabel(
  transmission: InvoiceEinvoicingTransmission,
): string {
  switch (transmission.status) {
    case "accepted":
      return "Transmise et acceptée";
    case "submitted":
      return "Transmise";
    case "rejected":
      return "Rejetée par la PA";
    case "failed":
      return "Échec de transmission";
    default:
      return "Transmission en cours";
  }
}

export function InvoiceEinvoicingCard({
  invoiceId,
  report,
  latestTransmission,
  platformPaEnabled,
}: InvoiceEinvoicingCardProps) {
  return (
    <Card>
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="text-base">Facturation électronique 2027</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-0 pt-0 sm:px-6">
        <p className="text-sm text-muted-foreground">
          {platformPaEnabled
            ? "À l'envoi, Factoni transmet automatiquement le Factur-X à la Plateforme Agréée. Vous n'avez rien d'autre à faire."
            : "Le bouton « Télécharger Factur-X » en haut de page génère le format obligatoire à terme pour la transmission via une Plateforme Agréée."}
        </p>

        <EinvoicingReadinessList items={report.items} />

        {latestTransmission ? (
          <p className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm">
            Dernière transmission : {transmissionLabel(latestTransmission)}
            {latestTransmission.error_message
              ? ` — ${latestTransmission.error_message}`
              : null}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
        <RetryEinvoicingTransmissionButton
          invoiceId={invoiceId}
          latestTransmission={latestTransmission}
        />
        <Link
          href="/settings/einvoicing"
          className="inline-flex h-11 items-center justify-center text-sm font-medium text-primary hover:underline sm:ml-auto"
        >
          Paramètres facturation électronique
        </Link>
      </CardFooter>
    </Card>
  );
}

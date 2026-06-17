import { CheckCircle2 } from "lucide-react";

import { DownloadPublicDocumentButton } from "@/components/public/download-public-document-button";
import { Card, CardContent } from "@/components/ui/card";
import { formatFrenchDateTime } from "@/lib/format/datetime";
import { formatCurrency } from "@/lib/invoices/calculate";

interface PublicQuoteAcceptedBannerProps {
  acceptedAt: string | null;
  acceptedByName: string | null;
  totalTtc: number;
  pdfUrl: string;
}

export function PublicQuoteAcceptedBanner({
  acceptedAt,
  acceptedByName,
  totalTtc,
  pdfUrl,
}: PublicQuoteAcceptedBannerProps) {
  return (
    <Card className="gap-0 border-emerald-200/80 bg-emerald-50/80 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
      <CardContent className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <CheckCircle2 className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">
              Devis accepté
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
              {acceptedByName ? (
                <>
                  Signé par <span className="font-medium">{acceptedByName}</span>
                  {acceptedAt ? (
                    <>
                      {" "}
                      le {formatFrenchDateTime(acceptedAt)}
                    </>
                  ) : null}
                  .
                </>
              ) : (
                "Votre acceptation a bien été enregistrée."
              )}
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed tabular-nums text-emerald-950 dark:text-emerald-50">
              Montant accepté : {formatCurrency(totalTtc)} TTC
            </p>
          </div>
        </div>

        <div className="flex justify-center sm:justify-start">
          <DownloadPublicDocumentButton
            url={pdfUrl}
            label="Télécharger le PDF"
            kind="pdf"
            variant="outline"
          />
        </div>
      </CardContent>
    </Card>
  );
}

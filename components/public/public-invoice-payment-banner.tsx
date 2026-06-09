import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatFrenchDateTime } from "@/lib/format/datetime";
import { formatCurrency } from "@/lib/invoices/calculate";

interface PublicInvoicePaymentBannerProps {
  variant: "success" | "cancelled" | "paid" | "pending";
  totalTtc?: number;
  paidAt?: string | null;
}

export function PublicInvoicePaymentBanner({
  variant,
  totalTtc,
  paidAt,
}: PublicInvoicePaymentBannerProps) {
  if (variant === "pending") {
    return (
      <Card className="gap-0 border-blue-200/80 bg-blue-50/80 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
        <CardContent className="flex items-start gap-3 px-5 py-5 sm:px-6 sm:py-6">
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300"
            aria-hidden
          />
          <div>
            <h2 className="font-semibold text-blue-950 dark:text-blue-50">
              Paiement en cours de confirmation
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-blue-900/80 dark:text-blue-100/80">
              Votre paiement a bien été reçu par Stripe. La facture sera
              marquée comme payée dans quelques instants.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "cancelled") {
    return (
      <Card className="gap-0 border-amber-200/80 bg-amber-50/80 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 px-5 py-5 sm:px-6 sm:py-6">
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300"
            aria-hidden
          />
          <div>
            <h2 className="font-semibold text-amber-950 dark:text-amber-50">
              Paiement annulé
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/80">
              Vous pouvez réessayer quand vous le souhaitez via le bouton « Payer
              maintenant ».
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 border-emerald-200/80 bg-emerald-50/80 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
      <CardContent className="flex items-start gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-300"
          aria-hidden
        />
        <div>
          <h2 className="font-semibold text-emerald-950 dark:text-emerald-50">
            {variant === "success" ? "Paiement confirmé" : "Facture payée"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
            {variant === "success"
              ? "Merci ! Votre paiement a bien été enregistré."
              : "Cette facture a été réglée."}
            {paidAt ? (
              <>
                {" "}
                Paiement le {formatFrenchDateTime(paidAt)}.
              </>
            ) : null}
          </p>
          {totalTtc != null ? (
            <p className="mt-2 text-sm font-medium tabular-nums text-emerald-950 dark:text-emerald-50">
              Montant : {formatCurrency(totalTtc)} TTC
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

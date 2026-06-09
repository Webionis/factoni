import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InvoiceNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-xl font-semibold">Facture introuvable</h1>
      <p className="mt-2 text-muted-foreground">
        Cette facture n&apos;existe pas ou ne vous appartient pas.
      </p>
      <Link
        href="/invoices"
        className={cn(buttonVariants(), "mt-6 inline-flex h-11")}
      >
        Retour aux factures
      </Link>
    </div>
  );
}

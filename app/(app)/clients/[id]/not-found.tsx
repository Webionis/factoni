import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ClientNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-xl font-semibold">Client introuvable</h1>
      <p className="mt-2 text-muted-foreground">
        Ce client n&apos;existe pas ou ne vous appartient pas.
      </p>
      <Link href="/clients" className={cn(buttonVariants(), "mt-6 inline-flex h-11")}>
        Retour aux clients
      </Link>
    </div>
  );
}

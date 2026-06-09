"use client";

import { useEffect } from "react";
import Link from "next/link";

import { captureException } from "@/lib/monitoring/sentry";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Le chargement de la page a échoué. Réessayez ou revenez à l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="h-11" onClick={() => reset()}>
          Réessayer
        </Button>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "h-11")}>
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}

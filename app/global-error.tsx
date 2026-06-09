"use client";

import { useEffect } from "react";

import { captureException } from "@/lib/monitoring/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest, scope: "global" });
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 font-sans text-neutral-900">
        <h1 className="text-2xl font-bold">Erreur critique</h1>
        <p className="mt-2 max-w-md text-center text-neutral-600">
          Factoni a rencontré un problème. Rechargez la page ou contactez le
          support si le problème persiste.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white"
        >
          Recharger
        </button>
      </body>
    </html>
  );
}

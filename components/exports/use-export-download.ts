"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { notifyExportCompleted } from "@/lib/exports/events";

export function useExportDownload() {
  const [downloading, setDownloading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);

  const download = useCallback(
    async (url: string, successMessage = "Export téléchargé") => {
      setDownloading(true);
      setProgressLabel("Préparation du fichier comptable…");
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Échec de l'export");
        }
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition");
        const match = disposition?.match(/filename="([^"]+)"/);
        const filename = match?.[1] ?? "export.csv";

        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(objectUrl);

        toast.success(successMessage);
        notifyExportCompleted();
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Impossible de télécharger";
        toast.error(message);
        return false;
      } finally {
        setDownloading(false);
        setProgressLabel(null);
      }
    },
    [],
  );

  return { downloading, progressLabel, download };
}

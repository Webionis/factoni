"use client";

import type { ComponentProps } from "react";
import { FileCode2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface DownloadFacturXButtonProps {
  apiPath: string;
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}

export function DownloadFacturXButton({
  apiPath,
  label = "Télécharger Factur-X",
  variant = "outline",
}: DownloadFacturXButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(apiPath, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Échec du téléchargement");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = "facture-factur-x.pdf";
      const match = disposition?.match(/filename="([^"]+)"/);
      if (match?.[1]) {
        filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("Factur-X téléchargé");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur Factur-X";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={loading}
      onClick={handleDownload}
    >
      <FileCode2 className="size-4" aria-hidden />
      {loading ? "Génération…" : label}
    </Button>
  );
}

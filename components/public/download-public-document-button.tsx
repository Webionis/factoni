"use client";

import { Download, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicDocumentKind = "pdf" | "receipt";

interface DownloadPublicDocumentButtonProps {
  url: string;
  label: string;
  kind?: PublicDocumentKind;
  variant?: "default" | "outline";
  className?: string;
}

export function DownloadPublicDocumentButton({
  url,
  label,
  kind = "pdf",
  variant = "outline",
  className,
}: DownloadPublicDocumentButtonProps) {
  const [loading, setLoading] = useState(false);
  const Icon = kind === "receipt" ? Receipt : Download;

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(url, { method: "GET", cache: "no-store" });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Échec du téléchargement");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = kind === "receipt" ? "recu-paiement.pdf" : "facture.pdf";
      const match = disposition?.match(/filename="([^"]+)"/);
      if (match?.[1]) {
        filename = match[1];
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);

      toast.success("Téléchargement lancé");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur de téléchargement";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("h-11 w-full gap-2 sm:w-auto", className)}
      disabled={loading}
      onClick={handleDownload}
    >
      <Icon className="size-4" aria-hidden />
      {loading ? "Téléchargement…" : label}
    </Button>
  );
}

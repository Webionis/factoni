"use client";

import { Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface DownloadInvoiceReceiptButtonProps {
  invoiceId: string;
  label?: string;
}

export function DownloadInvoiceReceiptButton({
  invoiceId,
  label = "Télécharger le reçu",
}: DownloadInvoiceReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/receipt`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Échec du téléchargement");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = "recu-paiement.pdf";
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

      toast.success("Reçu téléchargé");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur reçu";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={loading}
      onClick={handleDownload}
    >
      <Receipt className="size-4" aria-hidden />
      {loading ? "Génération…" : label}
    </Button>
  );
}

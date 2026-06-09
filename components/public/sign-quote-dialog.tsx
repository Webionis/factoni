"use client";

import { FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/public/signature-pad";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/invoices/calculate";
import { cn } from "@/lib/utils";

interface SignQuoteDialogProps {
  token: string;
  quoteNumber: string;
  totalTtc: number;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignQuoteDialog({
  token,
  quoteNumber,
  totalTtc,
  companyName,
  open,
  onOpenChange,
}: SignQuoteDialogProps) {
  const router = useRouter();
  const signatureRef = useRef<SignaturePadHandle>(null);
  const [signerName, setSignerName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setSignerName("");
    setConfirmed(false);
    signatureRef.current?.clear();
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      resetForm();
    }
  }

  async function handleSubmit() {
    const trimmedName = signerName.trim();
    if (trimmedName.length < 2) {
      toast.error("Veuillez indiquer votre nom complet.");
      return;
    }

    if (!confirmed) {
      toast.error("Veuillez confirmer l'acceptation du devis.");
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      toast.error("Veuillez dessiner votre signature.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/d/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: trimmedName,
          signatureDataUrl: signatureRef.current?.toDataUrl(),
          confirmed: true,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(
          result.error ?? "Impossible d'accepter le devis. Réessayez.",
        );
        return;
      }

      toast.success("Devis signé avec succès — merci pour votre confiance.");
      handleOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "!flex w-[calc(100vw-1.5rem)] max-w-[520px]",
          "max-h-[calc(100dvh-1.5rem)] flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/50 px-5 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="size-5 text-primary" aria-hidden />
            Accepter le devis
          </DialogTitle>
          <DialogDescription>
            Vous acceptez le devis {quoteNumber} de {companyName} pour un
            montant de {formatCurrency(totalTtc)} TTC.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          <FormField label="Nom du signataire" htmlFor="signer-name">
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Prénom et nom"
              maxLength={120}
              className="h-11"
              autoComplete="name"
            />
          </FormField>

          <FormField label="Signature" htmlFor="signature-pad">
            <SignaturePad ref={signatureRef} />
          </FormField>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span className="text-sm leading-relaxed text-foreground">
              Je confirme accepter ce devis et m&apos;engage à respecter les
              conditions indiquées.
            </span>
          </label>
        </div>

        <DialogFooter className="shrink-0 border-t border-border/50 bg-popover px-5 py-4 sm:px-6 sm:py-5">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Votre signature et la date seront enregistrées comme preuve
            d&apos;acceptation.
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto"
              disabled={submitting}
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="h-11 w-full gap-2 sm:w-auto"
              disabled={submitting}
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Enregistrement…" : "Signer et accepter"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

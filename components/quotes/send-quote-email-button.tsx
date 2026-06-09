"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  markQuoteSentOnMailtoAction,
  prepareQuoteMailtoAction,
} from "@/lib/actions/document-mailto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildAndOpenMailto } from "@/lib/email/open-mailto";
import { cn } from "@/lib/utils";

interface SendQuoteEmailButtonProps {
  quoteId: string;
  disabled?: boolean;
  disabledReason?: string;
  variant?: "default" | "outline";
}

export function SendQuoteEmailButton({
  quoteId,
  disabled = false,
  disabledReason,
  variant = "outline",
}: SendQuoteEmailButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function loadDefaults() {
    setLoadingDefaults(true);
    const result = await prepareQuoteMailtoAction(quoteId);
    setLoadingDefaults(false);

    if ("error" in result) {
      toast.error(result.error);
      setOpen(false);
      return;
    }

    setRecipientEmail(result.recipientEmail);
    setSubject(result.subject);
    setMessage(result.message);
  }

  function handleOpenChange(next: boolean) {
    if (disabled && next) return;
    setOpen(next);
    if (next) {
      setRecipientEmail("");
      setSubject("");
      setMessage("");
      void loadDefaults();
    }
  }

  function handleOpenInMailApp() {
    if (isPending) return;

    startTransition(async () => {
      const mailtoResult = buildAndOpenMailto({
        to: recipientEmail,
        subject,
        message,
      });

      if (!mailtoResult.ok) {
        if (mailtoResult.error.includes("application mail")) {
          toast.warning(mailtoResult.error);
        } else {
          toast.error(mailtoResult.error);
        }
        return;
      }

      const sentResult = await markQuoteSentOnMailtoAction(quoteId);
      if (sentResult.error) {
        toast.error(sentResult.error);
        return;
      }

      if (sentResult.transitioned) {
        toast.success("Le devis a été marqué comme envoyé.");
      } else {
        toast.message("Votre messagerie s'ouvre avec le message prérempli.");
      }

      setOpen(false);
      router.refresh();
    });
  }

  if (disabled && disabledReason) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <Button
          type="button"
          variant={variant}
          className="h-11 w-full gap-2 sm:w-auto"
          disabled
          title={disabledReason}
        >
          <Mail className="size-4" aria-hidden />
          Envoyer par email
        </Button>
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className="h-11 w-full gap-2 sm:w-auto"
        disabled={disabled}
        onClick={() => handleOpenChange(true)}
      >
        <Mail className="size-4" aria-hidden />
        Envoyer par email
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "!flex w-[calc(100vw-1.5rem)] max-w-[640px]",
            "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100vh-3rem)]",
            "flex-col gap-0 overflow-hidden p-0",
          )}
        >
          <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/50 px-5 py-4 sm:px-6 sm:py-5">
            <DialogTitle>Envoyer le devis par email</DialogTitle>
            <DialogDescription>
              Préparez le message, puis ouvrez votre messagerie pour
              l&apos;envoyer depuis votre adresse.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
            {loadingDefaults ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : (
              <div className="space-y-4">
                <FormField label="Destinataire" htmlFor="quote-email-to">
                  <Input
                    id="quote-email-to"
                    type="email"
                    value={recipientEmail}
                    readOnly
                    disabled
                    className="bg-muted/40"
                  />
                </FormField>

                <FormField label="Objet" htmlFor="quote-email-subject">
                  <Input
                    id="quote-email-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={200}
                  />
                </FormField>

                <FormField label="Message" htmlFor="quote-email-message">
                  <Textarea
                    id="quote-email-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={8000}
                    className="min-h-[180px] max-h-[280px] resize-none overflow-y-auto font-[inherit] leading-relaxed"
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border/50 bg-popover px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Le message sera ouvert dans votre application mail avec votre
              adresse personnelle. Vous pourrez le relire, l&apos;envoyer et
              ajouter le PDF si besoin.
            </p>
            <DialogFooter className="mt-3 flex w-full !flex-col gap-2 sm:!flex-row sm:items-center sm:justify-between">
              <DialogClose className="h-11 w-full sm:mr-auto sm:w-auto">
                Annuler
              </DialogClose>
              <Button
                type="button"
                className="h-11 w-full gap-2 sm:w-auto"
                disabled={
                  isPending ||
                  loadingDefaults ||
                  !subject.trim() ||
                  !message.trim()
                }
                onClick={handleOpenInMailApp}
              >
                <Mail className="size-4" aria-hidden />
                {isPending ? "…" : "Ouvrir dans ma messagerie"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

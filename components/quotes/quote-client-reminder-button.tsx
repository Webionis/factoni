"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { prepareQuoteReminderMailtoAction } from "@/lib/actions/document-mailto";
import { Button } from "@/components/ui/button";
import { buildAndOpenMailto } from "@/lib/email/open-mailto";

interface QuoteClientReminderButtonProps {
  quoteId: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function QuoteClientReminderButton({
  quoteId,
  disabled = false,
  disabledReason,
}: QuoteClientReminderButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleRemind() {
    setLoading(true);
    const result = await prepareQuoteReminderMailtoAction(quoteId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      if (process.env.NODE_ENV === "development" && result.code) {
        console.error("[QuoteClientReminder]", result.code, result.error);
      }
      return;
    }

    const mailtoResult = buildAndOpenMailto({
      to: result.recipientEmail,
      subject: result.subject,
      message: result.message,
    });

    if (!mailtoResult.ok) {
      if (mailtoResult.error.includes("application mail")) {
        toast.warning(mailtoResult.error);
      } else {
        toast.error(mailtoResult.error);
      }
      return;
    }

    toast.message("Votre messagerie s'ouvre avec le message de relance prérempli.");
  }

  if (disabled && disabledReason) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 sm:w-auto"
          disabled
          title={disabledReason}
        >
          <Mail className="size-4" aria-hidden />
          Relancer le client
        </Button>
        <p className="text-xs text-muted-foreground">{disabledReason}</p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full gap-2 sm:w-auto"
      disabled={disabled || loading}
      onClick={() => void handleRemind()}
    >
      <Mail className="size-4" aria-hidden />
      {loading ? "Préparation…" : "Relancer le client"}
    </Button>
  );
}

"use client";

import { PenLine } from "lucide-react";
import { useState } from "react";

import { SignQuoteDialog } from "@/components/public/sign-quote-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AcceptPublicQuoteButtonProps {
  token: string;
  quoteNumber: string;
  totalTtc: number;
  companyName: string;
  className?: string;
}

export function AcceptPublicQuoteButton({
  token,
  quoteNumber,
  totalTtc,
  companyName,
  className,
}: AcceptPublicQuoteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className={cn("h-11 w-full gap-2 sm:w-auto", className)}
        onClick={() => setOpen(true)}
      >
        <PenLine className="size-4" aria-hidden />
        Accepter le devis
      </Button>

      <SignQuoteDialog
        token={token}
        quoteNumber={quoteNumber}
        totalTtc={totalTtc}
        companyName={companyName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

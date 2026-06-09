"use client";

import { AcceptPublicQuoteButton } from "@/components/public/accept-public-quote-button";
import { PayInvoiceButton } from "@/components/public/pay-invoice-button";
import { PayQuoteDepositButton } from "@/components/public/pay-quote-deposit-button";
import {
  mobileFixedActionBarClassName,
  mobileFixedActionSpacerClassName,
} from "@/lib/constants/mobile";

interface PublicDocumentMobileBarProps {
  token: string;
  canPayInvoice: boolean;
  canPayDeposit: boolean;
  canAccept: boolean;
  amountLabel: string;
  depositAmountLabel: string;
  quoteNumber: string;
  totalTtc: number;
  companyName: string;
}

export function PublicDocumentMobileBar({
  token,
  canPayInvoice,
  canPayDeposit,
  canAccept,
  amountLabel,
  depositAmountLabel,
  quoteNumber,
  totalTtc,
  companyName,
}: PublicDocumentMobileBarProps) {
  const hasPrimaryAction = canPayInvoice || canPayDeposit || canAccept;

  if (!hasPrimaryAction) return null;

  return (
    <>
      <div className={mobileFixedActionSpacerClassName} aria-hidden />
      <div className={mobileFixedActionBarClassName}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
          {canPayInvoice ? (
            <PayInvoiceButton
              token={token}
              amountLabel={amountLabel}
              className="h-12 w-full text-base"
            />
          ) : null}
          {canPayDeposit ? (
            <PayQuoteDepositButton
              token={token}
              amountLabel={depositAmountLabel}
              className="h-12 w-full text-base"
            />
          ) : null}
          {canAccept ? (
            <AcceptPublicQuoteButton
              token={token}
              quoteNumber={quoteNumber}
              totalTtc={totalTtc}
              companyName={companyName}
              className="h-12 w-full text-base"
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

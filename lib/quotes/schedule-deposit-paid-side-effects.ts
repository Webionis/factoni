import { handleQuoteDepositPaidSideEffects } from "@/lib/quotes/handle-deposit-paid-side-effects";
import { revalidatePath } from "next/cache";

export interface ScheduleDepositPaidSideEffectsParams {
  source: string;
  transitioned?: boolean;
  paidAt?: string;
  publicToken?: string | null;
  depositAmount?: number;
  balanceInvoiceId?: string;
  depositInvoiceId?: string;
}

export async function runQuoteDepositPaidSideEffects(
  quoteId: string,
  params: ScheduleDepositPaidSideEffectsParams,
): Promise<{ notificationCreated: boolean; emailSent: boolean }> {
  const result = await handleQuoteDepositPaidSideEffects(quoteId, {
    source: params.source,
    transitioned: params.transitioned,
    paidAt: params.paidAt,
  });

  revalidatePath("/dashboard");
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${quoteId}`);
  if (params.balanceInvoiceId) {
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${params.balanceInvoiceId}`);
  }
  if (params.publicToken) {
    revalidatePath(`/d/${params.publicToken}`);
  }

  return result;
}

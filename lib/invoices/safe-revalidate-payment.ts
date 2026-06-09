import { revalidateInvoicePaymentPaths } from "@/lib/invoices/revalidate-invoice-payment";
import { logServerError } from "@/lib/logger";

/** Revalidation cache — ne doit jamais bloquer notification/email. */
export function safeRevalidateInvoicePayment(params: {
  invoiceId: string;
  publicToken?: string | null;
  source: string;
}): void {
  try {
    revalidateInvoicePaymentPaths({
      invoiceId: params.invoiceId,
      publicToken: params.publicToken,
    });
  } catch (error) {
    logServerError("safeRevalidateInvoicePayment", error, {
      invoiceId: params.invoiceId,
      source: params.source,
    });
  }
}

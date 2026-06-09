import { revalidatePath } from "next/cache";

export function revalidateInvoicePaymentPaths(params: {
  invoiceId: string;
  publicToken?: string | null;
}): void {
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${params.invoiceId}`);

  const token = params.publicToken?.trim();
  if (token) {
    revalidatePath(`/d/${token}`);
  }
}

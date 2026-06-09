export type InvoicePaidLogStep =
  | "ENTER"
  | "EXIT"
  | "invoice_loaded"
  | "notification_check"
  | "notification_insert_attempt"
  | "notification_insert_success"
  | "notification_insert_skipped"
  | "email_send_attempt"
  | "email_send_success"
  | "email_send_skipped"
  | "skipped_already_notified"
  | "skipped_already_paid"
  | "invoice_not_paid"
  | "invoice_not_found"
  | "transitioned"
  | "recover_side_effects"
  | "scheduled_after"
  | "run_sync"
  | "api_confirm"
  | "error";

export function logInvoicePaid(
  step: InvoicePaidLogStep,
  details: Record<string, unknown>,
): void {
  const payload = { step, ...details, timestamp: new Date().toISOString() };
  console.info("[invoice.paid]", payload);
}

export function logStripePayment(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.payment] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function logStripeSync(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.sync] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function logStripeWebhook(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.webhook] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

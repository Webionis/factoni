export function logDepositPaid(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info("[quote.deposit.paid]", {
    step,
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function logStripeDepositCheckout(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.deposit.checkout] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function logStripeDepositSync(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.deposit.sync] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

export function logStripeDepositWebhook(
  step: string,
  details: Record<string, unknown>,
): void {
  console.info(`[stripe.webhook.deposit] ${step}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}

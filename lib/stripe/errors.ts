import { logServerError } from "@/lib/logger";

export interface StripeErrorDetails {
  type?: string;
  code?: string;
  message: string;
  param?: string;
  docUrl?: string;
  stack?: string;
}

function isStripeLikeError(
  error: Error,
): error is Error & {
  type?: string;
  code?: string;
  param?: string;
  doc_url?: string;
} {
  return "type" in error || "code" in error;
}

export function extractStripeErrorDetails(error: unknown): StripeErrorDetails {
  if (error instanceof Error) {
    if (isStripeLikeError(error)) {
      return {
        type: typeof error.type === "string" ? error.type : undefined,
        code: typeof error.code === "string" ? error.code : undefined,
        message: error.message,
        param: typeof error.param === "string" ? error.param : undefined,
        docUrl: typeof error.doc_url === "string" ? error.doc_url : undefined,
        stack: error.stack,
      };
    }

    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : "Erreur Stripe inconnue.",
  };
}

/** Message lisible pour toast (dev) ou logs. */
export function formatStripeErrorMessage(error: unknown): string {
  const details = extractStripeErrorDetails(error);
  const parts = [details.message];
  if (details.code) parts.push(`(${details.code})`);
  return parts.join(" ");
}

export function logStripeConnectError(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
): StripeErrorDetails {
  const details = extractStripeErrorDetails(error);

  if (process.env.NODE_ENV === "development") {
    console.error(`[${scope}] Stripe Connect error`, {
      type: details.type,
      code: details.code,
      message: details.message,
      param: details.param,
      docUrl: details.docUrl,
      stack: details.stack,
      ...context,
    });
  } else {
    logServerError(scope, error, {
      stripeType: details.type,
      stripeCode: details.code,
      stripeMessage: details.message,
      stripeParam: details.param,
      ...context,
    });
  }

  return details;
}

export function stripeConnectUserErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return formatStripeErrorMessage(error);
  }
  return "Impossible de lancer l'onboarding Stripe. Réessayez.";
}

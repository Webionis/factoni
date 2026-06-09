import { Resend } from "resend";

import {
  EMAIL_NOT_CONFIGURED_MESSAGE,
  getEmailEnvConfig,
  isEmailConfigured,
} from "@/lib/env";

let resendSingleton: Resend | null = null;

export function getResendClient(): Resend | null {
  const config = getEmailEnvConfig();
  if (!config) return null;

  if (!resendSingleton) {
    resendSingleton = new Resend(config.apiKey);
  }

  return resendSingleton;
}

export function getEmailFromAddress(): string | null {
  return getEmailEnvConfig()?.from ?? null;
}

export { EMAIL_NOT_CONFIGURED_MESSAGE, isEmailConfigured };

/** @deprecated Utiliser EMAIL_NOT_CONFIGURED_MESSAGE */
export const RESEND_NOT_CONFIGURED_MESSAGE = EMAIL_NOT_CONFIGURED_MESSAGE;

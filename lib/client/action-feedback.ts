"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/actions/errors";
import { NETWORK_ERROR_MESSAGE, SESSION_EXPIRED_CODE } from "@/lib/actions/errors";

export async function runServerAction<T extends ActionResult>(
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (err) {
    unstable_rethrow(err);
    return { error: NETWORK_ERROR_MESSAGE } as T;
  }
}

export function applyActionResult(
  result: ActionResult,
  router: AppRouterInstance,
  options?: {
    successMessage?: string;
    onSuccess?: () => void;
    setServerError?: (msg: string | null) => void;
  },
): boolean {
  if (result.error) {
    if (result.error === SESSION_EXPIRED_CODE) {
      toast.error("Votre session a expiré. Reconnectez-vous.");
      router.push("/login?error=session_expired");
      return false;
    }
    options?.setServerError?.(result.error);
    toast.error(result.error);
    return false;
  }

  if (result.success && options?.successMessage) {
    toast.success(options.successMessage);
  }
  if (result.successDetail) {
    toast.success(result.successDetail);
  }
  if (result.warning) {
    toast.warning(result.warning);
  }
  options?.onSuccess?.();
  return true;
}

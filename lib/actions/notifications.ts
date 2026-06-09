"use server";

import { revalidatePath } from "next/cache";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead as markRead,
} from "@/lib/data/notifications";
import { requireAuthenticatedUser } from "@/lib/actions/utils";

export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error ?? "Non authentifié" };
  }

  const success = await markAllNotificationsAsRead(
    auth.supabase,
    auth.user.id,
  );
  return success ? { success: true } : { success: false, error: "Échec mise à jour" };
}

export async function markNotificationAsReadAction(
  notificationId: string,
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error || !auth.user) {
    return { success: false, error: auth.error ?? "Non authentifié" };
  }

  const success = await markRead(auth.supabase, notificationId, auth.user.id);
  if (success) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
  }
  return success ? { success: true } : { success: false, error: "Échec mise à jour" };
}

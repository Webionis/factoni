"use server";

import { revalidatePath } from "next/cache";

import { type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { requireFeatureForUser } from "@/lib/billing/feature-guard";
import { getClientById } from "@/lib/data/clients";
import {
  buildClientPortalUrl,
  ensureClientPortalToken,
} from "@/lib/client-portal/tokens";

export async function getClientPortalLinkAction(
  clientId: string,
): Promise<{ error: string } | { url: string }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const featureCheck = await requireFeatureForUser(
    supabase,
    user.id,
    "advancedTracking",
  );
  if (!featureCheck.ok) return { error: featureCheck.error };

  const client = await getClientById(supabase, clientId);
  if (!client || client.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  if (!client.portal_access_enabled) {
    return { error: "L'accès portail est désactivé pour ce client." };
  }

  const result = await ensureClientPortalToken(supabase, clientId, user.id);
  if (!result.ok) {
    return { error: result.error };
  }

  return { url: buildClientPortalUrl(result.token) };
}

export async function toggleClientPortalAccessAction(
  clientId: string,
  enabled: boolean,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  if (enabled) {
    const featureCheck = await requireFeatureForUser(
      supabase,
      user.id,
      "advancedTracking",
    );
    if (!featureCheck.ok) return { error: featureCheck.error };
  }

  const { error } = await supabase
    .from("clients")
    .update({ portal_access_enabled: enabled })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Impossible de mettre à jour l'accès portail." };
  }

  if (enabled) {
    await ensureClientPortalToken(supabase, clientId, user.id);
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

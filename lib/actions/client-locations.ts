"use server";

import { revalidatePath } from "next/cache";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getClientById } from "@/lib/data/clients";
import { getClientLocationById } from "@/lib/data/client-locations";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import {
  clientLocationFormSchema,
  type ClientLocationFormValues,
} from "@/lib/validations/client-location";

function revalidateClientLocationPaths(clientId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/invoices");
  revalidatePath("/quotes");
}

export async function createClientLocationAction(
  clientId: string,
  rawValues: ClientLocationFormValues,
): Promise<ActionResult & { locationId?: string }> {
  const parsed = clientLocationFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const client = await getClientById(supabase, clientId);
  if (!client || client.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const { data, error } = await supabase
    .from("client_locations")
    .insert({
      user_id: user.id,
      client_id: clientId,
      label: sanitizeText(parsed.data.label),
      address_line1: sanitizeOptionalText(parsed.data.address_line1),
      address_line2: sanitizeOptionalText(parsed.data.address_line2),
      postal_code: sanitizeOptionalText(parsed.data.postal_code),
      city: sanitizeOptionalText(parsed.data.city),
      country: sanitizeOptionalText(parsed.data.country) || "France",
      notes: sanitizeOptionalText(parsed.data.notes),
      is_default: parsed.data.is_default ?? false,
    })
    .select("id")
    .single();

  if (error || !data) {
    return actionErrorFromSupabase(error, "Erreur lors de la création du lieu");
  }

  revalidateClientLocationPaths(clientId);
  return { success: true, locationId: data.id };
}

export async function updateClientLocationAction(
  locationId: string,
  rawValues: ClientLocationFormValues,
): Promise<ActionResult> {
  const parsed = clientLocationFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getClientLocationById(supabase, locationId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Lieu introuvable." };
  }

  const { error } = await supabase
    .from("client_locations")
    .update({
      label: sanitizeText(parsed.data.label),
      address_line1: sanitizeOptionalText(parsed.data.address_line1),
      address_line2: sanitizeOptionalText(parsed.data.address_line2),
      postal_code: sanitizeOptionalText(parsed.data.postal_code),
      city: sanitizeOptionalText(parsed.data.city),
      country: sanitizeOptionalText(parsed.data.country) || "France",
      notes: sanitizeOptionalText(parsed.data.notes),
      is_default: parsed.data.is_default ?? existing.is_default,
    })
    .eq("id", locationId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la mise à jour");
  }

  revalidateClientLocationPaths(existing.client_id);
  return { success: true };
}

export async function archiveClientLocationAction(
  locationId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getClientLocationById(supabase, locationId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Lieu introuvable." };
  }

  const { error } = await supabase
    .from("client_locations")
    .update({
      archived_at: new Date().toISOString(),
      is_default: false,
    })
    .eq("id", locationId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de l'archivage");
  }

  revalidateClientLocationPaths(existing.client_id);
  return { success: true };
}

export async function setDefaultClientLocationAction(
  locationId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getClientLocationById(supabase, locationId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Lieu introuvable." };
  }

  const { error } = await supabase
    .from("client_locations")
    .update({ is_default: true })
    .eq("id", locationId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la mise à jour");
  }

  revalidateClientLocationPaths(existing.client_id);
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionErrorFromSupabase, type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { requireClientQuota } from "@/lib/billing/plan-limits-guard";
import { ensureClientPortalToken } from "@/lib/client-portal/tokens";
import { getClientById } from "@/lib/data/clients";
import {
  clientFormSchema,
  formValuesToClientPayload,
  type ClientFormValues,
} from "@/lib/validations/client";

export async function createClientAction(
  rawValues: ClientFormValues,
): Promise<ActionResult> {
  const parsed = clientFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const quotaCheck = await requireClientQuota(supabase, user.id);
  if (!quotaCheck.ok) return { error: quotaCheck.error };

  const payload = formValuesToClientPayload(parsed.data, user.id);
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return actionErrorFromSupabase(error);
  }

  await ensureClientPortalToken(supabase, data.id, user.id);

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(
  clientId: string,
  rawValues: ClientFormValues,
): Promise<ActionResult> {
  const parsed = clientFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getClientById(supabase, clientId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const payload = formValuesToClientPayload(parsed.data, user.id);
  const { error } = await supabase
    .from("clients")
    .update({
      client_type: payload.client_type,
      name: payload.name,
      company_name: payload.company_name,
      email: payload.email,
      phone: payload.phone,
      address_line1: payload.address_line1,
      address_line2: payload.address_line2,
      postal_code: payload.postal_code,
      city: payload.city,
      country: payload.country,
      siren: payload.siren,
      siret: payload.siret,
      notes: payload.notes,
    })
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/edit`);
  return { success: true };
}

export async function deleteClientAction(clientId: string): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getClientById(supabase, clientId);
  if (!existing || existing.user_id !== user.id) {
    return { error: "Client introuvable." };
  }

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/clients");
  redirect("/clients");
}

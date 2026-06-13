"use server";

import { revalidatePath } from "next/cache";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getClientById } from "@/lib/data/clients";
import { getActiveClientLocationById } from "@/lib/data/client-locations";
import {
  getScheduledJobById,
  type ScheduledJobWithRelations,
} from "@/lib/data/scheduled-jobs";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import {
  scheduledJobFormSchema,
  type ScheduledJobFormValues,
} from "@/lib/validations/scheduled-job";

function normalizeOptionalId(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return value.trim();
}

function revalidateAgendaPaths() {
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

async function validateJobRelations(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  clientId: string | null,
  locationId: string | null,
): Promise<{ error?: string }> {
  if (!clientId && locationId) {
    return { error: "Sélectionnez un client pour ce lieu d'intervention." };
  }

  if (clientId) {
    const client = await getClientById(supabase, clientId);
    if (!client || client.user_id !== userId) {
      return { error: "Client introuvable." };
    }
  }

  if (locationId) {
    const location = await getActiveClientLocationById(supabase, locationId, userId);
    if (!location || (clientId && location.client_id !== clientId)) {
      return { error: "Lieu d'intervention introuvable pour ce client." };
    }
  }

  return {};
}

export async function createScheduledJobAction(
  rawValues: ScheduledJobFormValues,
): Promise<ActionResult & { job?: ScheduledJobWithRelations }> {
  const parsed = scheduledJobFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const clientId = normalizeOptionalId(parsed.data.client_id);
  const locationId = normalizeOptionalId(parsed.data.client_location_id);
  const relationCheck = await validateJobRelations(
    supabase,
    user.id,
    clientId,
    locationId,
  );
  if (relationCheck.error) return { error: relationCheck.error };

  const { data, error } = await supabase
    .from("scheduled_jobs")
    .insert({
      user_id: user.id,
      client_id: clientId,
      client_location_id: locationId,
      title: sanitizeText(parsed.data.title),
      scheduled_date: parsed.data.scheduled_date,
      scheduled_time: parsed.data.scheduled_time?.trim() || null,
      status: parsed.data.status,
      notes: sanitizeOptionalText(parsed.data.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return actionErrorFromSupabase(error, "Erreur lors de la planification");
  }

  const job = await getScheduledJobById(supabase, data.id, user.id);
  revalidateAgendaPaths();
  return { success: true, job: job ?? undefined };
}

export async function updateScheduledJobAction(
  jobId: string,
  rawValues: ScheduledJobFormValues,
): Promise<ActionResult & { job?: ScheduledJobWithRelations }> {
  const parsed = scheduledJobFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getScheduledJobById(supabase, jobId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Chantier introuvable." };
  }

  const clientId = normalizeOptionalId(parsed.data.client_id);
  const locationId = normalizeOptionalId(parsed.data.client_location_id);
  const relationCheck = await validateJobRelations(
    supabase,
    user.id,
    clientId,
    locationId,
  );
  if (relationCheck.error) return { error: relationCheck.error };

  const { error } = await supabase
    .from("scheduled_jobs")
    .update({
      client_id: clientId,
      client_location_id: locationId,
      title: sanitizeText(parsed.data.title),
      scheduled_date: parsed.data.scheduled_date,
      scheduled_time: parsed.data.scheduled_time?.trim() || null,
      status: parsed.data.status,
      notes: sanitizeOptionalText(parsed.data.notes),
    })
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la mise à jour");
  }

  const job = await getScheduledJobById(supabase, jobId, user.id);
  revalidateAgendaPaths();
  return { success: true, job: job ?? undefined };
}

export async function archiveScheduledJobAction(
  jobId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("scheduled_jobs")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la suppression");
  }

  revalidateAgendaPaths();
  return { success: true };
}

export async function updateScheduledJobStatusAction(
  jobId: string,
  status: ScheduledJobFormValues["status"],
): Promise<ActionResult & { job?: ScheduledJobWithRelations }> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("scheduled_jobs")
    .update({ status })
    .eq("id", jobId)
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la mise à jour");
  }

  const job = await getScheduledJobById(supabase, jobId, user.id);
  revalidateAgendaPaths();
  return { success: true, job: job ?? undefined };
}

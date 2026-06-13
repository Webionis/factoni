import type { SupabaseClient } from "@supabase/supabase-js";

import type { ScheduledJobStatus } from "@/lib/validations/scheduled-job";
import { logServerError } from "@/lib/logger";
import type { Database } from "@/types/database";

export type ScheduledJobRow =
  Database["public"]["Tables"]["scheduled_jobs"]["Row"];

export type ScheduledJobWithRelations = ScheduledJobRow & {
  clients: {
    id: string;
    name: string;
    company_name: string | null;
    client_type: Database["public"]["Enums"]["client_type"];
  } | null;
  client_locations: {
    id: string;
    label: string;
    address_line1: string | null;
    postal_code: string | null;
    city: string | null;
  } | null;
};

const JOB_SELECT = `
  *,
  clients (
    id,
    name,
    company_name,
    client_type
  ),
  client_locations (
    id,
    label,
    address_line1,
    postal_code,
    city
  )
`;

export async function listScheduledJobsForRange(
  supabase: SupabaseClient<Database>,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<ScheduledJobWithRelations[]> {
  const { data, error } = await supabase
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("user_id", userId)
    .is("archived_at", null)
    .gte("scheduled_date", fromDate)
    .lte("scheduled_date", toDate)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true, nullsFirst: false })
    .order("title", { ascending: true });

  if (error) {
    logServerError("listScheduledJobsForRange", error, { userId, fromDate, toDate });
    return [];
  }

  return (data ?? []) as ScheduledJobWithRelations[];
}

export async function listUpcomingScheduledJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  fromDate: string,
  limit = 8,
): Promise<ScheduledJobWithRelations[]> {
  const { data, error } = await supabase
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("user_id", userId)
    .is("archived_at", null)
    .gte("scheduled_date", fromDate)
    .in("status", ["planned", "in_progress"])
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    logServerError("listUpcomingScheduledJobs", error, { userId, fromDate });
    return [];
  }

  return (data ?? []) as ScheduledJobWithRelations[];
}

export async function countScheduledJobsInRange(
  supabase: SupabaseClient<Database>,
  userId: string,
  fromDate: string,
  toDate: string,
  statuses: ScheduledJobStatus[] = ["planned", "in_progress"],
): Promise<number> {
  const { count, error } = await supabase
    .from("scheduled_jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("archived_at", null)
    .gte("scheduled_date", fromDate)
    .lte("scheduled_date", toDate)
    .in("status", statuses);

  if (error) {
    logServerError("countScheduledJobsInRange", error);
    return 0;
  }

  return count ?? 0;
}

export async function getScheduledJobById(
  supabase: SupabaseClient<Database>,
  jobId: string,
  userId: string,
): Promise<ScheduledJobWithRelations | null> {
  const { data, error } = await supabase
    .from("scheduled_jobs")
    .select(JOB_SELECT)
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ScheduledJobWithRelations;
}

export function scheduledJobClientLabel(
  job: Pick<ScheduledJobWithRelations, "clients">,
): string | null {
  const client = job.clients;
  if (!client) return null;
  if (client.client_type === "company" && client.company_name) {
    return client.company_name;
  }
  return client.name;
}

export function scheduledJobLocationLabel(
  job: Pick<ScheduledJobWithRelations, "client_locations">,
): string | null {
  return job.client_locations?.label ?? null;
}

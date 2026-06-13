import type { ScheduledJobStatus } from "@/lib/validations/scheduled-job";

export const SCHEDULED_JOB_STATUS_LABELS: Record<ScheduledJobStatus, string> = {
  planned: "Planifié",
  in_progress: "En cours",
  done: "Terminé",
  cancelled: "Annulé",
};

export type ScheduledJobStatusTone =
  | "default"
  | "info"
  | "success"
  | "muted";

export const SCHEDULED_JOB_STATUS_TONES: Record<
  ScheduledJobStatus,
  ScheduledJobStatusTone
> = {
  planned: "info",
  in_progress: "default",
  done: "success",
  cancelled: "muted",
};

export function formatScheduledJobTime(time: string | null): string | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return null;
  return `${hours}:${minutes}`;
}

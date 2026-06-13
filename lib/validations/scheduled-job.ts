import { z } from "zod";

export const SCHEDULED_JOB_STATUSES = [
  "planned",
  "in_progress",
  "done",
  "cancelled",
] as const;

export type ScheduledJobStatus = (typeof SCHEDULED_JOB_STATUSES)[number];

export const scheduledJobFormSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200, "Titre trop long"),
  client_id: z
    .union([z.string().uuid("Client invalide"), z.literal(""), z.null()])
    .optional(),
  client_location_id: z
    .union([z.string().uuid("Lieu invalide"), z.literal(""), z.null()])
    .optional(),
  scheduled_date: z.string().min(1, "Date requise"),
  scheduled_time: z.string().optional(),
  status: z.enum(SCHEDULED_JOB_STATUSES).default("planned"),
  notes: z.string().optional(),
});

export type ScheduledJobFormValues = z.infer<typeof scheduledJobFormSchema>;

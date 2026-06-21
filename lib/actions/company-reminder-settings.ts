"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionErrorFromSupabase, type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { getCompanyForUser } from "@/lib/auth/profile";
import { requireFeatureForUser } from "@/lib/billing/feature-guard";
import { sanitizeOptionalText } from "@/lib/sanitize";

const reminderSettingsSchema = z.object({
  auto_reminders_enabled: z.boolean(),
  auto_reminder_day_3: z.boolean(),
  auto_reminder_day_7: z.boolean(),
  auto_reminder_day_14: z.boolean(),
  reminder_email_subject: z.string().max(200).optional(),
  reminder_email_message: z.string().max(8000).optional(),
});

export type CompanyReminderSettingsValues = z.infer<
  typeof reminderSettingsSchema
>;

export async function updateCompanyReminderSettingsAction(
  values: CompanyReminderSettingsValues,
): Promise<ActionResult> {
  const parsed = reminderSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  if (parsed.data.auto_reminders_enabled) {
    const featureCheck = await requireFeatureForUser(
      supabase,
      user.id,
      "automaticReminders",
    );
    if (!featureCheck.ok) return { error: featureCheck.error };
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    return { error: "Entreprise introuvable." };
  }

  const { error } = await supabase
    .from("companies")
    .update({
      auto_reminders_enabled: parsed.data.auto_reminders_enabled,
      auto_reminder_day_3: parsed.data.auto_reminder_day_3,
      auto_reminder_day_7: parsed.data.auto_reminder_day_7,
      auto_reminder_day_14: parsed.data.auto_reminder_day_14,
      reminder_email_subject: sanitizeOptionalText(
        parsed.data.reminder_email_subject,
        200,
      ),
      reminder_email_message: sanitizeOptionalText(
        parsed.data.reminder_email_message,
        8000,
      ),
    })
    .eq("id", company.id);

  if (error) {
    return actionErrorFromSupabase(error);
  }

  revalidatePath("/settings/company");
  return { success: true };
}

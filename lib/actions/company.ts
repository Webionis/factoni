"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionErrorFromSupabase, type ActionResult } from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import { createClient } from "@/lib/supabase/server";
import {
  companyFormSchema,
  formValuesToCompanyPayload,
  type CompanyFormValues,
} from "@/lib/validations/company";

export type { ActionResult } from "@/lib/actions/errors";

async function upsertCompanyForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  payload: ReturnType<typeof formValuesToCompanyPayload>,
) {
  const { data: existing, error: fetchError } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return actionErrorFromSupabase(fetchError);
  }

  if (existing) {
    const { error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      return actionErrorFromSupabase(error);
    }
  } else {
    const { error } = await supabase.from("companies").insert(payload);

    if (error) {
      return actionErrorFromSupabase(error);
    }
  }

  return { success: true as const };
}

export async function completeOnboarding(
  rawValues: CompanyFormValues,
): Promise<ActionResult> {
  const parsed = companyFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const payload = formValuesToCompanyPayload(parsed.data, user.id);
  const companyResult = await upsertCompanyForUser(supabase, user.id, payload);

  if (companyResult.error) {
    return companyResult;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) {
    return actionErrorFromSupabase(profileError);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateCompany(
  rawValues: CompanyFormValues,
): Promise<ActionResult> {
  const parsed = companyFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const payload = formValuesToCompanyPayload(parsed.data, user.id);
  const result = await upsertCompanyForUser(supabase, user.id, payload);

  if (result.error) {
    return result;
  }

  revalidatePath("/settings/company");
  return { success: true };
}

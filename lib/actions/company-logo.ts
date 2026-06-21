"use server";

import { revalidatePath } from "next/cache";

import { actionErrorFromSupabase, type ActionResult } from "@/lib/actions/errors";
import { logServerError } from "@/lib/logger";
import { getAuthenticatedUser, requireAuthenticatedUser } from "@/lib/actions/utils";
import { requireFeatureForUser } from "@/lib/billing/feature-guard";
import { getCompanyForUser } from "@/lib/auth/profile";
import {
  buildCompanyLogoPath,
  COMPANY_LOGOS_BUCKET,
  validateLogoFile,
} from "@/lib/storage/company-logo";

export type LogoActionResult = ActionResult & {
  logoPath?: string | null;
  previewUrl?: string | null;
};

async function getLogoSignedUrl(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  logoPath: string | null,
): Promise<string | null> {
  if (!logoPath) return null;
  const { data, error } = await supabase.storage
    .from(COMPANY_LOGOS_BUCKET)
    .createSignedUrl(logoPath, 3600);
  if (error) {
    logServerError("getLogoSignedUrl", error, { logoPath });
    return null;
  }
  return data.signedUrl;
}

export async function getCompanyLogoPreviewUrl(): Promise<string | null> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return null;
  const company = await getCompanyForUser(supabase, user.id);
  return getLogoSignedUrl(supabase, company?.logo_path ?? null);
}

export async function uploadCompanyLogoAction(
  formData: FormData,
): Promise<LogoActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const featureCheck = await requireFeatureForUser(
    supabase,
    user.id,
    "customLogo",
  );
  if (!featureCheck.ok) return { error: featureCheck.error };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Aucun fichier sélectionné." };
  }

  const validationError = validateLogoFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    return {
      error: "Enregistrez d'abord les informations de votre entreprise.",
    };
  }

  const newPath = buildCompanyLogoPath(user.id, file.type);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (company.logo_path && company.logo_path !== newPath) {
    await supabase.storage
      .from(COMPANY_LOGOS_BUCKET)
      .remove([company.logo_path]);
  }

  const { error: uploadError } = await supabase.storage
    .from(COMPANY_LOGOS_BUCKET)
    .upload(newPath, bytes, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    return actionErrorFromSupabase(uploadError);
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_path: newPath })
    .eq("user_id", user.id);

  if (updateError) {
    return actionErrorFromSupabase(updateError);
  }

  revalidatePath("/settings/company");
  revalidatePath("/onboarding");

  const previewUrl = await getLogoSignedUrl(supabase, newPath);

  return {
    success: true,
    logoPath: newPath,
    previewUrl,
  };
}

export async function removeCompanyLogoAction(): Promise<LogoActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const company = await getCompanyForUser(supabase, user.id);
  if (!company?.logo_path) {
    return { success: true, logoPath: null, previewUrl: null };
  }

  const { error: removeError } = await supabase.storage
    .from(COMPANY_LOGOS_BUCKET)
    .remove([company.logo_path]);

  if (removeError) {
    return actionErrorFromSupabase(removeError);
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_path: null })
    .eq("user_id", user.id);

  if (updateError) {
    return actionErrorFromSupabase(updateError);
  }

  revalidatePath("/settings/company");

  return { success: true, logoPath: null, previewUrl: null };
}

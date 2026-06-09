import { randomBytes } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/site";
import type { Database } from "@/types/database";

/** Token URL-safe (32+ caractères) pour le portail client /client/{token}. */
export function generateClientPortalToken(): string {
  return randomBytes(24).toString("base64url");
}

export function buildClientPortalUrl(token: string): string {
  const base =
    process.env.NODE_ENV === "production"
      ? siteConfig.productionUrl
      : siteConfig.url;
  return `${base.replace(/\/$/, "")}/client/${token}`;
}

function getWriteClient(
  userClient: SupabaseClient<Database>,
): SupabaseClient<Database> {
  if (isAdminClientConfigured()) {
    return createAdminClient();
  }
  return userClient;
}

export type EnsurePortalTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function ensureClientPortalToken(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<EnsurePortalTokenResult> {
  const { data: client, error: readError } = await supabase
    .from("clients")
    .select("id, user_id, portal_token, portal_access_enabled")
    .eq("id", clientId)
    .maybeSingle();

  if (readError) {
    logServerError("ensureClientPortalToken.read", readError, { clientId });
    return { ok: false, error: "Impossible de lire le client." };
  }

  if (!client || client.user_id !== userId) {
    return { ok: false, error: "Client introuvable." };
  }

  const existing = client.portal_token?.trim();
  if (existing && existing.length >= 16) {
    return { ok: true, token: existing };
  }

  const writeClient = getWriteClient(supabase);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = generateClientPortalToken();
    const { data: updated, error: updateError } = await writeClient
      .from("clients")
      .update({
        portal_token: token,
        portal_token_created_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .eq("user_id", userId)
      .is("portal_token", null)
      .select("portal_token")
      .maybeSingle();

    if (!updateError && updated?.portal_token) {
      return { ok: true, token: updated.portal_token };
    }

    if (updateError?.code === "23505") {
      continue;
    }

    if (updateError) {
      logServerError("ensureClientPortalToken.update", updateError, { clientId });
      return { ok: false, error: "Impossible de générer le token portail." };
    }

    const { data: current } = await supabase
      .from("clients")
      .select("portal_token")
      .eq("id", clientId)
      .maybeSingle();

    if (current?.portal_token) {
      return { ok: true, token: current.portal_token };
    }
  }

  return { ok: false, error: "Impossible de générer le token portail." };
}

export async function ensureClientPortalUrl(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const result = await ensureClientPortalToken(supabase, clientId, userId);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, url: buildClientPortalUrl(result.token) };
}

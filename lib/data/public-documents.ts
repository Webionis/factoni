import type { SupabaseClient } from "@supabase/supabase-js";

import { ensureClientPortalToken } from "@/lib/client-portal/tokens";
import {
  buildPublicDocumentUrl,
  generatePublicDocumentToken,
} from "@/lib/documents/public-token";
import type { InvoiceDetail } from "@/lib/data/invoices";
import { logServerError } from "@/lib/logger";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

export type PublicDocumentPayload = {
  document: Database["public"]["Tables"]["invoices"]["Row"];
  lines: Database["public"]["Tables"]["invoice_lines"]["Row"][];
};

export type EnsurePublicTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string; code?: string };

function logTokenDebug(
  scope: string,
  details: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${scope}]`, details);
  }
}

function mapPublicTokenError(
  error: { message?: string; code?: string } | null | undefined,
): EnsurePublicTokenResult {
  const code = error?.code;
  const message = error?.message ?? "";

  logTokenDebug("mapPublicTokenError", { code, message });

  if (code === "42703" || message.includes("public_document_token does not exist")) {
    return {
      ok: false,
      code: "migration_missing",
      error:
        "Les liens publics ne sont pas activés sur la base de données. Appliquez les migrations Supabase.",
    };
  }

  if (code === "PGRST116") {
    return {
      ok: false,
      code: "update_failed",
      error: "Impossible de mettre à jour le lien public du document.",
    };
  }

  if (code === "23505" || message.includes("unique_violation")) {
    return {
      ok: false,
      code: "unique_violation",
      error: "Conflit de token — réessayez.",
    };
  }

  if (message.includes("not_authenticated")) {
    return { ok: false, code: "auth", error: "Vous devez être connecté." };
  }

  if (message.includes("document_not_found")) {
    return { ok: false, code: "document_not_found", error: "Document introuvable." };
  }

  if (message.includes("token_generation_failed")) {
    return {
      ok: false,
      code: "token_generation_failed",
      error: "Impossible de générer le lien public du document.",
    };
  }

  return {
    ok: false,
    code: code ?? "unknown",
    error: "Impossible de générer le lien public du document.",
  };
}

function getWriteClient(
  userClient: SupabaseClient<Database>,
): SupabaseClient<Database> {
  if (isAdminClientConfigured()) {
    return createAdminClient();
  }
  return userClient;
}

async function persistPublicToken(
  userClient: SupabaseClient<Database>,
  documentId: string,
  userId: string,
  token: string,
): Promise<EnsurePublicTokenResult> {
  const client = getWriteClient(userClient);

  const { data: updated, error: updateError } = await client
    .from("invoices")
    .update({
      public_document_token: token,
      public_document_token_created_at: new Date().toISOString(),
      public_access_enabled: true,
    })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("public_document_token")
    .maybeSingle();

  if (updateError) {
    logServerError("ensurePublicDocumentToken.update", updateError, {
      documentId,
      userId,
      usesAdmin: isAdminClientConfigured(),
      code: updateError.code,
    });
    return mapPublicTokenError(updateError);
  }

  if (!updated?.public_document_token) {
    logTokenDebug("ensurePublicDocumentToken.update", {
      documentId,
      userId,
      usesAdmin: isAdminClientConfigured(),
      reason: "no_row_updated",
    });
    return {
      ok: false,
      code: "update_failed",
      error: "Impossible de mettre à jour le lien public du document.",
    };
  }

  return { ok: true, token: updated.public_document_token };
}

async function enablePublicAccess(
  userClient: SupabaseClient<Database>,
  documentId: string,
  userId: string,
): Promise<void> {
  const client = getWriteClient(userClient);
  const { error } = await client
    .from("invoices")
    .update({ public_access_enabled: true })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    logServerError("ensurePublicDocumentToken.enableAccess", error, {
      documentId,
      userId,
    });
  }
}

export async function ensurePublicDocumentToken(
  supabase: SupabaseClient<Database>,
  documentId: string,
  userId: string,
): Promise<EnsurePublicTokenResult> {
  const { data: doc, error: readError } = await supabase
    .from("invoices")
    .select(
      "id, user_id, client_id, archived_at, public_document_token, public_access_enabled",
    )
    .eq("id", documentId)
    .maybeSingle();

  if (readError) {
    logServerError("ensurePublicDocumentToken.read", readError, {
      documentId,
      userId,
      code: readError.code,
    });
    return mapPublicTokenError(readError);
  }

  if (!doc || doc.user_id !== userId) {
    logTokenDebug("ensurePublicDocumentToken.read", {
      documentId,
      userId,
      found: Boolean(doc),
      reason: "document_not_found",
    });
    return {
      ok: false,
      code: "document_not_found",
      error: "Document introuvable.",
    };
  }

  if (doc.archived_at) {
    return {
      ok: false,
      code: "archived",
      error: "Ce document est archivé.",
    };
  }

  const existingToken = doc.public_document_token?.trim();
  if (existingToken && existingToken.length >= 16) {
    if (!doc.public_access_enabled) {
      await enablePublicAccess(supabase, documentId, userId);
    }
    if (doc.client_id) {
      await ensureClientPortalToken(supabase, doc.client_id, userId);
    }
    return { ok: true, token: existingToken };
  }

  if (!isAdminClientConfigured()) {
    logTokenDebug("ensurePublicDocumentToken", {
      reason: "missing_service_role_key",
      hint: "Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local et redémarrez le serveur.",
    });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generatePublicDocumentToken();
    const result = await persistPublicToken(
      supabase,
      documentId,
      userId,
      token,
    );

    if (result.ok) {
      if (doc.client_id) {
        await ensureClientPortalToken(supabase, doc.client_id, userId);
      }
      return result;
    }

    if (result.code === "unique_violation") {
      continue;
    }

    return result;
  }

  return {
    ok: false,
    code: "token_generation_failed",
    error: "Impossible de générer le lien public du document.",
  };
}

export type EnsurePublicUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string; code?: string };

export async function ensurePublicDocumentUrl(
  supabase: SupabaseClient<Database>,
  documentId: string,
  userId: string,
): Promise<EnsurePublicUrlResult> {
  const result = await ensurePublicDocumentToken(supabase, documentId, userId);
  if (!result.ok) {
    return { ok: false, error: result.error, code: result.code };
  }
  return { ok: true, url: buildPublicDocumentUrl(result.token) };
}

export async function getPublicDocumentByToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<PublicDocumentPayload | null> {
  const { data, error } = await supabase.rpc("get_public_document_by_token", {
    p_token: token,
  });

  if (error) {
    logServerError("getPublicDocumentByToken", error);
    return null;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const payload = data as { document?: Json; lines?: Json };
  if (!payload.document || typeof payload.document !== "object") {
    return null;
  }

  const document = payload.document as Database["public"]["Tables"]["invoices"]["Row"];
  const lines = Array.isArray(payload.lines)
    ? (payload.lines as Database["public"]["Tables"]["invoice_lines"]["Row"][])
    : [];

  return { document, lines };
}

export function publicDocumentToInvoiceDetail(
  payload: PublicDocumentPayload,
): InvoiceDetail {
  return {
    ...payload.document,
    clients: null,
    invoice_lines: [...payload.lines].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function acceptQuoteByPublicToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("accept_quote_by_public_token", {
    p_token: token,
  });

  if (error) {
    logServerError("acceptQuoteByPublicToken", error);
    return false;
  }

  return data === true;
}

export async function markQuoteViewedByPublicToken(
  supabase: SupabaseClient<Database>,
  token: string,
): Promise<void> {
  const { error } = await supabase.rpc("mark_quote_viewed_by_public_token", {
    p_token: token,
  });

  if (error) {
    logServerError("markQuoteViewedByPublicToken", error);
  }
}

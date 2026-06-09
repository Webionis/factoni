import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ExportFormat,
  ExportHistoryRecord,
  ExportType,
} from "@/lib/exports/types";
import { logServerError } from "@/lib/logger";
import type { Database, Json } from "@/types/database";

const MAX_HISTORY = 10;

export async function recordExportHistory(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    exportType: ExportType;
    format: ExportFormat;
    label: string;
    filters: Record<string, unknown>;
    rowCount: number;
    fileSizeBytes: number;
  },
): Promise<void> {
  const { error } = await supabase.from("export_history").insert({
    user_id: params.userId,
    export_type: params.exportType,
    format: params.format,
    label: params.label,
    filters: params.filters as Json,
    row_count: params.rowCount,
    file_size_bytes: params.fileSizeBytes,
  });

  if (error) {
    logServerError("recordExportHistory", error, {
      userId: params.userId,
      exportType: params.exportType,
    });
    return;
  }

  const { data: oldRows } = await supabase
    .from("export_history")
    .select("id")
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false })
    .range(MAX_HISTORY, MAX_HISTORY + 50);

  if (oldRows && oldRows.length > 0) {
    await supabase
      .from("export_history")
      .delete()
      .in(
        "id",
        oldRows.map((r) => r.id),
      );
  }
}

export async function listExportHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = MAX_HISTORY,
): Promise<ExportHistoryRecord[]> {
  const { data, error } = await supabase
    .from("export_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logServerError("listExportHistory", error, { userId });
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    exportType: row.export_type as ExportType,
    format: row.format as ExportFormat,
    label: row.label,
    filters: (row.filters as Record<string, unknown>) ?? {},
    rowCount: row.row_count,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
  }));
}

export async function getExportHistoryById(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<ExportHistoryRecord | null> {
  const { data, error } = await supabase
    .from("export_history")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    logServerError("getExportHistoryById", error, { id, userId });
    return null;
  }

  return {
    id: data.id,
    exportType: data.export_type as ExportType,
    format: data.format as ExportFormat,
    label: data.label,
    filters: (data.filters as Record<string, unknown>) ?? {},
    rowCount: data.row_count,
    fileSizeBytes: data.file_size_bytes,
    createdAt: data.created_at,
  };
}

export function buildExportLabel(params: {
  exportType: ExportType;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const period =
    params.dateFrom && params.dateTo
      ? `${params.dateFrom} → ${params.dateTo}`
      : params.dateFrom
        ? `depuis ${params.dateFrom}`
        : "toutes périodes";

  const labels: Record<ExportType, string> = {
    invoices: "Export factures",
    clients: "Export clients",
    quotes: "Export devis",
    journal: "Journal des ventes",
  };

  return `${labels[params.exportType]} — ${period}`;
}

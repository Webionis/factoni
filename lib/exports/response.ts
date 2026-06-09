import type { ExportFormat } from "@/lib/exports/types";

const MIME_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export function buildExportResponse(params: {
  body: BodyInit;
  format: ExportFormat;
  filename: string;
  rowCount: number;
  isBeta: boolean;
}): Response {
  return new Response(params.body, {
    status: 200,
    headers: {
      "Content-Type": MIME_TYPES[params.format],
      "Content-Disposition": `attachment; filename="${params.filename}"`,
      "Cache-Control": "no-store",
      "X-Export-Rows": String(params.rowCount),
      "X-Export-Beta": params.isBeta ? "true" : "false",
      "X-Export-Format": params.format,
    },
  });
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportType = "invoices" | "clients" | "quotes" | "journal";

export type InvoiceExportStatusFilter =
  | "all"
  | "paid"
  | "sent"
  | "overdue"
  | "cancelled"
  | "draft"
  | "archived";

export interface InvoiceExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status: InvoiceExportStatusFilter;
  includeArchived: boolean;
  excludeDrafts: boolean;
  excludeCancelled: boolean;
  paidOnly: boolean;
  includeVatDetail: boolean;
}

export type QuoteExportStatusFilter =
  | "all"
  | "draft"
  | "ready"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export interface QuoteExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status: QuoteExportStatusFilter;
}

export interface ExportSummary {
  invoiceCount: number;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  paidCount: number;
  unpaidCount: number;
}

export type PeriodPresetId =
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "last_30_days"
  | "current_quarter";

export interface ExportHistoryRecord {
  id: string;
  exportType: ExportType;
  format: ExportFormat;
  label: string;
  filters: Record<string, unknown>;
  rowCount: number;
  fileSizeBytes: number;
  createdAt: string;
}

"use client";

import { ClientsExportSection } from "@/components/exports/clients-export-section";
import { ExportHistorySection } from "@/components/exports/export-history-section";
import { InvoiceExportSection } from "@/components/exports/invoice-export-section";
import { JournalExportSection } from "@/components/exports/journal-export-section";
import { MonthlyExportSettings } from "@/components/exports/monthly-export-settings";
import { QuotesExportSection } from "@/components/exports/quotes-export-section";

export function ExportsHub() {
  return (
    <div className="space-y-6">
      <InvoiceExportSection />

      <div className="grid gap-6 lg:grid-cols-2">
        <ClientsExportSection />
        <QuotesExportSection />
      </div>

      <JournalExportSection />
      <ExportHistorySection />
      <MonthlyExportSettings />
    </div>
  );
}

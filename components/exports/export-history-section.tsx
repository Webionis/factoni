"use client";

import { Download, FileSpreadsheet, History, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useExportDownload } from "@/components/exports/use-export-download";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { EXPORT_COMPLETED_EVENT } from "@/lib/exports/events";
import { formatBytes } from "@/lib/exports/formatting";
import type { ExportHistoryRecord } from "@/lib/exports/types";
import { cn } from "@/lib/utils";

function formatExportDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const FORMAT_LABELS: Record<string, string> = {
  csv: "CSV",
  xlsx: "Excel",
  pdf: "PDF",
};

export function ExportHistorySection() {
  const [history, setHistory] = useState<ExportHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { downloading, download } = useExportDownload();

  const loadHistory = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/exports/history", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { history: ExportHistoryRecord[] };
        setHistory(data.history ?? []);
      }
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const onExportCompleted = () => {
      void loadHistory({ silent: true });
    };
    window.addEventListener(EXPORT_COMPLETED_EVENT, onExportCompleted);
    return () =>
      window.removeEventListener(EXPORT_COMPLETED_EVENT, onExportCompleted);
  }, [loadHistory]);

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] dark:bg-[rgba(71,85,105,0.2)]">
          <History className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className={sectionHeadingClassName}>Derniers exports</h2>
          <p className={cn("mt-1 text-sm leading-relaxed", formSectionDescriptionClassName)}>
            Historique des 10 derniers exports — retéléchargement en un clic.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))
        ) : history.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="Aucun export pour l'instant"
            description="Vos exports apparaîtront ici après le premier téléchargement."
          />
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] px-4 py-3 dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.35)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatExportDate(item.createdAt)} · {FORMAT_LABELS[item.format] ?? item.format} ·{" "}
                  {item.rowCount} lignes · {formatBytes(item.fileSizeBytes)}
                </p>
              </div>
              {item.exportType === "invoices" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={downloading}
                  onClick={() =>
                    void download(
                      `/api/exports/history/${item.id}`,
                      "Export retéléchargé",
                    ).then((ok) => {
                      if (ok) void loadHistory();
                    })
                  }
                >
                  {downloading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  Retélécharger
                </Button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

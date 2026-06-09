"use client";

import { BookOpen, Download, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FormatSelector } from "@/components/exports/format-selector";
import { useExportDownload } from "@/components/exports/use-export-download";
import { Button } from "@/components/ui/button";
import {
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import type { ExportFormat } from "@/lib/exports/types";
import { cn } from "@/lib/utils";

export function JournalExportSection() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const { downloading, progressLabel, download } = useExportDownload();

  const downloadUrl = useMemo(() => {
    const params = new URLSearchParams({ format });
    return `/api/exports/journal?${params.toString()}`;
  }, [format]);

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] dark:bg-[rgba(217,119,6,0.15)]">
          <BookOpen className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className={sectionHeadingClassName}>Journal des ventes</h2>
          <p className={cn("mt-1 text-sm leading-relaxed", formSectionDescriptionClassName)}>
            Format expert-comptable (comptes 411, 706, 44571) — compatible Sage,
            Pennylane, Indy, Cegid.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <FormatSelector value={format} onChange={setFormat} allowed={["csv", "xlsx"]} />
      </div>

      {progressLabel ? (
        <p className="mt-4 text-sm text-muted-foreground">{progressLabel}</p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="mt-5 h-11 gap-2"
        onClick={() => void download(downloadUrl, "Journal des ventes téléchargé")}
        disabled={downloading}
      >
        {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Télécharger le journal
      </Button>
    </section>
  );
}

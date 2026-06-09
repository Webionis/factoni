"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FormatSelector } from "@/components/exports/format-selector";
import { useExportDownload } from "@/components/exports/use-export-download";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import type { ExportFormat, QuoteExportStatusFilter } from "@/lib/exports/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: QuoteExportStatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "ready", label: "Prêt à envoyer" },
  { value: "sent", label: "Envoyé" },
  { value: "viewed", label: "Consulté" },
  { value: "accepted", label: "Accepté" },
  { value: "rejected", label: "Refusé" },
  { value: "expired", label: "Expiré" },
  { value: "cancelled", label: "Annulé" },
];

export function QuotesExportSection() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [status, setStatus] = useState<QuoteExportStatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { downloading, progressLabel, download } = useExportDownload();

  const downloadUrl = useMemo(() => {
    const params = new URLSearchParams({ format, status });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/api/exports/quotes?${params.toString()}`;
  }, [format, status, dateFrom, dateTo]);

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a] dark:bg-[rgba(22,163,74,0.15)]">
          <FileText className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className={sectionHeadingClassName}>Exporter les devis</h2>
          <p className={cn("mt-1 text-sm leading-relaxed", formSectionDescriptionClassName)}>
            Numéro, client, montant, statut, dates de signature et validité.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as QuoteExportStatusFilter)}>
            <SelectTrigger className="w-full">
              <span className="truncate">
                {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ??
                  "Tous"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Format</Label>
          <FormatSelector value={format} onChange={setFormat} allowed={["csv", "xlsx"]} />
        </div>
        <div className="space-y-2">
          <Label>Date début</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date fin</Label>
          <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {progressLabel ? (
        <p className="mt-4 text-sm text-muted-foreground">{progressLabel}</p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="mt-5 h-11 gap-2"
        onClick={() => void download(downloadUrl, "Export devis téléchargé")}
        disabled={downloading}
      >
        {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Télécharger
      </Button>
    </section>
  );
}

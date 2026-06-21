"use client";

import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ExportSummaryCards } from "@/components/exports/export-summary-cards";
import { FormatSelector } from "@/components/exports/format-selector";
import { PeriodPresetsBar } from "@/components/exports/period-presets-bar";
import { useExportDownload } from "@/components/exports/use-export-download";
import { FeaturePlanHint } from "@/components/billing/feature-plan-hint";
import { useHasFeature, useSubscriptionAccess } from "@/components/billing/subscription-provider";
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
  betaBadgeClassName,
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { resolvePeriodPreset } from "@/lib/exports/period-presets";
import type {
  ExportFormat,
  ExportSummary,
  InvoiceExportStatusFilter,
  PeriodPresetId,
} from "@/lib/exports/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: InvoiceExportStatusFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "paid", label: "Payées" },
  { value: "sent", label: "Envoyées" },
  { value: "overdue", label: "En retard" },
  { value: "cancelled", label: "Annulées" },
  { value: "draft", label: "Brouillons" },
  { value: "archived", label: "Archivées" },
];

function buildParams(filters: Record<string, string | boolean | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) continue;
    params.set(key, value === true ? "true" : String(value));
  }
  return params;
}

export function InvoiceExportSection() {
  const { isBeta } = useSubscriptionAccess();
  const hasExportAccess = useHasFeature("accountingExport");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState<PeriodPresetId | null>(null);
  const [status, setStatus] = useState<InvoiceExportStatusFilter>("all");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [excludeDrafts, setExcludeDrafts] = useState(true);
  const [excludeCancelled, setExcludeCancelled] = useState(false);
  const [paidOnly, setPaidOnly] = useState(false);
  const [includeVatDetail, setIncludeVatDetail] = useState(true);
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const { downloading, progressLabel, download } = useExportDownload();

  const filterParams = useMemo(
    () =>
      buildParams({
        dateFrom,
        dateTo,
        status,
        includeArchived,
        excludeDrafts,
        excludeCancelled,
        paidOnly,
        includeVatDetail,
      }),
    [
      dateFrom,
      dateTo,
      status,
      includeArchived,
      excludeDrafts,
      excludeCancelled,
      paidOnly,
      includeVatDetail,
    ],
  );

  const downloadUrl = useMemo(() => {
    const params = new URLSearchParams(filterParams);
    params.set("format", format);
    return `/api/exports/invoices?${params.toString()}`;
  }, [filterParams, format]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/exports/summary?${filterParams.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        setSummary((await res.json()) as ExportSummary);
      }
    } finally {
      setSummaryLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  function handlePreset(presetId: PeriodPresetId) {
    const range = resolvePeriodPreset(presetId);
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
    setActivePreset(presetId);
  }

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={sectionHeadingClassName}>Export des factures</h2>
          <p className={cn("mt-1 max-w-2xl text-sm leading-relaxed", formSectionDescriptionClassName)}>
            Centre d&apos;export comptable — CSV, Excel ou PDF prêt pour votre
            expert-comptable.
          </p>
        </div>
        <span className={betaBadgeClassName}>
          {isBeta ? "Inclus — offre de lancement" : "Starter et Pro"}
        </span>
      </div>

      <FeaturePlanHint
        feature="accountingExport"
        variant={isBeta ? "beta-offered" : "future-plan"}
        className="mt-3"
      />

      <div className="mt-6 space-y-3">
        <Label>Période rapide</Label>
        <PeriodPresetsBar activePreset={activePreset} onSelect={handlePreset} />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="export-date-from">Date début</Label>
          <Input
            id="export-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setActivePreset(null);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="export-date-to">Date fin</Label>
          <Input
            id="export-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value);
              setActivePreset(null);
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="export-status">Statut</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as InvoiceExportStatusFilter)}
          >
            <SelectTrigger id="export-status" className="w-full">
              <span className="truncate">
                {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ??
                  "Toutes"}
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
          <FormatSelector value={format} onChange={setFormat} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          { id: "exclude-drafts", label: "Exclure les brouillons", checked: excludeDrafts, set: setExcludeDrafts },
          { id: "exclude-cancelled", label: "Exclure les annulées", checked: excludeCancelled, set: setExcludeCancelled },
          { id: "paid-only", label: "Uniquement les factures payées", checked: paidOnly, set: setPaidOnly },
          { id: "include-archived", label: "Inclure les factures archivées", checked: includeArchived, set: setIncludeArchived },
          { id: "include-vat", label: "Inclure le détail TVA", checked: includeVatDetail, set: setIncludeVatDetail },
        ].map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155] dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.5)] dark:text-[#cbd5e1]"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.set(e.target.checked)}
              className="size-4 rounded border-[rgba(15,23,42,0.15)] text-[#2563eb]"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Label>Résumé comptable</Label>
        <ExportSummaryCards summary={summary} loading={summaryLoading} />
      </div>

      {progressLabel ? (
        <p className="mt-4 text-sm text-muted-foreground">{progressLabel}</p>
      ) : null}

      <Button
        type="button"
        className="mt-6 h-11 gap-2 px-6"
        onClick={() => void download(downloadUrl, "Export factures téléchargé")}
        disabled={downloading || !hasExportAccess}
      >
        {downloading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
        Télécharger l&apos;export
      </Button>
    </section>
  );
}

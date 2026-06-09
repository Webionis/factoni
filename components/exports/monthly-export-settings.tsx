"use client";

import { CalendarClock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { FormatSelector } from "@/components/exports/format-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  betaBadgeClassName,
  formSectionDescriptionClassName,
  sectionHeadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import type { ExportFormat } from "@/lib/exports/types";
import { EXPORT_SCHEDULE_CRON_ENABLED } from "@/lib/exports/schedule-config";
import { cn } from "@/lib/utils";

interface ScheduleState {
  enabled: boolean;
  format: ExportFormat;
  recipientEmail: string;
}

const comingSoonBadgeClassName =
  "inline-flex shrink-0 items-center rounded-full border border-[rgba(148,163,184,0.25)] bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#64748b] dark:border-[rgba(148,163,184,0.2)] dark:bg-[rgba(71,85,105,0.25)] dark:text-[#94a3b8]";

export function MonthlyExportSettings() {
  const [schedule, setSchedule] = useState<ScheduleState>({
    enabled: false,
    format: "xlsx",
    recipientEmail: "",
  });
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    if (!EXPORT_SCHEDULE_CRON_ENABLED) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/exports/schedule", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as {
          schedule: {
            enabled: boolean;
            format: ExportFormat;
            recipient_email: string;
          } | null;
        };
        if (data.schedule) {
          setSchedule({
            enabled: data.schedule.enabled,
            format: data.schedule.format,
            recipientEmail: data.schedule.recipient_email,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const isDisabled = !EXPORT_SCHEDULE_CRON_ENABLED;

  return (
    <section className={cn(surfaceCardClassName, "p-6 sm:p-7")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed] dark:bg-[rgba(124,58,237,0.15)]">
            <CalendarClock className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className={sectionHeadingClassName}>Export automatique mensuel</h2>
            <p
              className={cn(
                "mt-1 max-w-xl text-sm leading-relaxed",
                formSectionDescriptionClassName,
              )}
            >
              Recevez votre export comptable le 1er de chaque mois par email.
            </p>
          </div>
        </div>
        {isDisabled ? (
          <span className={comingSoonBadgeClassName}>Bientôt disponible</span>
        ) : (
          <span className={betaBadgeClassName}>Premium</span>
        )}
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div
          className={cn(
            "mt-5 space-y-4",
            isDisabled && "pointer-events-none opacity-60",
          )}
          aria-disabled={isDisabled}
        >
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[rgba(15,23,42,0.06)] bg-[#f8fafc] px-4 py-3 text-sm dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.5)]">
            <input
              type="checkbox"
              checked={schedule.enabled}
              disabled={isDisabled}
              onChange={(e) =>
                setSchedule((s) => ({ ...s, enabled: e.target.checked }))
              }
              className="size-4 rounded text-[#2563eb]"
            />
            Recevoir automatiquement mon export comptable chaque mois
          </label>

          <div className="space-y-2">
            <Label htmlFor="export-schedule-email">Email destinataire</Label>
            <Input
              id="export-schedule-email"
              type="email"
              placeholder="comptable@cabinet.fr"
              value={schedule.recipientEmail}
              disabled={isDisabled}
              onChange={(e) =>
                setSchedule((s) => ({ ...s, recipientEmail: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <FormatSelector
              value={schedule.format}
              onChange={(format) => setSchedule((s) => ({ ...s, format }))}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            disabled={isDisabled}
            title={
              isDisabled
                ? "L'envoi automatique sera disponible prochainement"
                : undefined
            }
          >
            Enregistrer
          </Button>

          {isDisabled ? (
            <p className="text-xs text-muted-foreground">
              L&apos;infrastructure est prête — l&apos;activation suivra le
              déploiement du cron mensuel.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

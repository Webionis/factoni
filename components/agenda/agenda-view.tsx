"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";

import { ScheduledJobCard } from "@/components/agenda/scheduled-job-card";
import { ScheduledJobFormSheet } from "@/components/agenda/scheduled-job-form-sheet";
import { updateScheduledJobStatusAction } from "@/lib/actions/scheduled-jobs";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";
import {
  addMonths,
  addWeeks,
  buildMonthGrid,
  daysInWeek,
  endOfMonth,
  endOfWeek,
  formatDayLabel,
  formatMonthLabel,
  formatShortDayLabel,
  formatWeekRangeLabel,
  isToday,
  parseIsoDate,
  startOfMonth,
  startOfWeek,
  toIsoDate,
} from "@/lib/dates/calendar-range";
import { agendaCopy } from "@/lib/agenda/copy";
import type { ClientRow } from "@/lib/validations/client";
import { Button } from "@/components/ui/button";
import {
  filterPillActiveClassName,
  filterPillClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type AgendaViewMode = "week" | "month";

interface AgendaViewProps {
  clients: ClientRow[];
  initialJobs: ScheduledJobWithRelations[];
  initialRange: { from: string; to: string };
  initialOpenCreate?: boolean;
}

function jobsByDate(jobs: ScheduledJobWithRelations[]): Map<string, ScheduledJobWithRelations[]> {
  const map = new Map<string, ScheduledJobWithRelations[]>();
  for (const job of jobs) {
    const list = map.get(job.scheduled_date) ?? [];
    list.push(job);
    map.set(job.scheduled_date, list);
  }
  return map;
}

export function AgendaView({
  clients,
  initialJobs,
  initialRange,
  initialOpenCreate = false,
}: AgendaViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<AgendaViewMode>("week");
  const [anchor, setAnchor] = useState(() => startOfWeek(today, true));
  const [selectedDay, setSelectedDay] = useState(() => toIsoDate(today));
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(initialOpenCreate);
  const [editingJob, setEditingJob] = useState<ScheduledJobWithRelations | null>(
    null,
  );
  const [, startStatusTransition] = useTransition();
  const skipInitialFetch = useRef(true);

  const range = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfWeek(anchor, true);
      const end = endOfWeek(anchor, true);
      return { from: toIsoDate(start), to: toIsoDate(end) };
    }
    const start = startOfMonth(anchor);
    const end = endOfMonth(anchor);
    const gridStart = startOfWeek(start, true);
    const gridEnd = endOfWeek(end, true);
    return { from: toIsoDate(gridStart), to: toIsoDate(gridEnd) };
  }, [anchor, viewMode]);

  const fetchJobs = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agenda/jobs?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as { jobs: ScheduledJobWithRelations[] };
      setJobs(data.jobs ?? []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setEditingJob(null);
    setSheetOpen(true);
    router.replace("/agenda", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (
      skipInitialFetch.current &&
      range.from === initialRange.from &&
      range.to === initialRange.to
    ) {
      skipInitialFetch.current = false;
      return;
    }
    void fetchJobs(range.from, range.to);
  }, [range.from, range.to, fetchJobs, initialRange.from, initialRange.to]);

  const jobsMap = useMemo(() => jobsByDate(jobs), [jobs]);

  const periodLabel =
    viewMode === "week"
      ? formatWeekRangeLabel(startOfWeek(anchor, true), endOfWeek(anchor, true))
      : formatMonthLabel(anchor);

  function navigatePrev() {
    setAnchor((current) =>
      viewMode === "week" ? addWeeks(current, -1) : addMonths(current, -1),
    );
  }

  function navigateNext() {
    setAnchor((current) =>
      viewMode === "week" ? addWeeks(current, 1) : addMonths(current, 1),
    );
  }

  function goToToday() {
    const now = new Date();
    setAnchor(viewMode === "week" ? startOfWeek(now, true) : startOfMonth(now));
    setSelectedDay(toIsoDate(now));
  }

  function openCreate(date?: string) {
    setEditingJob(null);
    if (date) setSelectedDay(date);
    setSheetOpen(true);
  }

  function openEdit(job: ScheduledJobWithRelations) {
    setEditingJob(job);
    setSheetOpen(true);
  }

  function upsertJob(job: ScheduledJobWithRelations) {
    setJobs((current) => {
      const exists = current.some((item) => item.id === job.id);
      const next = exists
        ? current.map((item) => (item.id === job.id ? job : item))
        : [...current, job];
      return next.sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return a.scheduled_date.localeCompare(b.scheduled_date);
        }
        const ta = a.scheduled_time ?? "";
        const tb = b.scheduled_time ?? "";
        if (ta !== tb) return ta.localeCompare(tb);
        return a.title.localeCompare(b.title, "fr");
      });
    });
  }

  function removeJob(jobId: string) {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }

  function markDone(job: ScheduledJobWithRelations) {
    startStatusTransition(async () => {
      const result = await updateScheduledJobStatusAction(job.id, "done");
      if (result.job) upsertJob(result.job);
    });
  }

  const weekDays = daysInWeek(anchor);
  const monthGrid = buildMonthGrid(anchor);
  const selectedJobs = jobsMap.get(selectedDay) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            onClick={navigatePrev}
            aria-label="Période précédente"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 min-w-0 flex-1 px-3 sm:min-w-[12rem] sm:flex-none"
            onClick={goToToday}
          >
            Aujourd&apos;hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            onClick={navigateNext}
            aria-label="Période suivante"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>

        <p className="text-center text-sm font-semibold sm:text-base">
          {periodLabel}
          {loading ? (
            <Loader2 className="ml-2 inline size-4 animate-spin text-muted-foreground" />
          ) : null}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            className={cn(
              filterPillClassName,
              viewMode === "week" && filterPillActiveClassName,
              "flex-1 sm:flex-none",
            )}
            onClick={() => setViewMode("week")}
          >
            Semaine
          </button>
          <button
            type="button"
            className={cn(
              filterPillClassName,
              viewMode === "month" && filterPillActiveClassName,
              "flex-1 sm:flex-none",
            )}
            onClick={() => setViewMode("month")}
          >
            Mois
          </button>
        </div>
      </div>

      {viewMode === "week" ? (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const iso = toIsoDate(day);
            const dayJobs = jobsMap.get(iso) ?? [];
            const todayFlag = isToday(day, today);

            return (
              <section
                key={iso}
                className={cn(
                  "rounded-xl border p-4",
                  todayFlag
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/60 bg-card",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3
                    className={cn(
                      "text-sm font-semibold capitalize sm:text-base",
                      todayFlag && "text-primary",
                    )}
                  >
                    {formatDayLabel(day)}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={() => openCreate(iso)}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Ajouter
                  </Button>
                </div>

                {dayJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun rendez-vous planifié
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {dayJobs.map((job) => (
                      <li key={job.id}>
                        <ScheduledJobCard
                          job={job}
                          compact
                          onClick={() => openEdit(job)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "overflow-hidden rounded-xl border bg-card",
              surfaceCardClassName,
            )}
          >
            <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
                <div key={label} className="py-2">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthGrid.map((day) => {
                const iso = toIsoDate(day);
                const inMonth = day.getMonth() === anchor.getMonth();
                const dayJobs = jobsMap.get(iso) ?? [];
                const selected = selectedDay === iso;
                const todayFlag = isToday(day, today);

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDay(iso)}
                    className={cn(
                      "min-h-[4.5rem] border-b border-r border-border/40 p-1.5 text-left transition-colors sm:min-h-[5.5rem] sm:p-2",
                      !inMonth && "bg-muted/20 text-muted-foreground/60",
                      selected && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                      todayFlag && !selected && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold sm:text-sm",
                        todayFlag && "bg-primary text-primary-foreground",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayJobs.length > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        {dayJobs.slice(0, 2).map((job) => (
                          <p
                            key={job.id}
                            className="truncate rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary sm:text-[10px]"
                          >
                            {job.title}
                          </p>
                        ))}
                        {dayJobs.length > 2 ? (
                          <p className="text-[9px] text-muted-foreground">
                            +{dayJobs.length - 2}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold capitalize sm:text-base">
                {formatShortDayLabel(parseIsoDate(selectedDay))}
              </h3>
              <Button
                type="button"
                size="sm"
                className="h-9 gap-1"
                onClick={() => openCreate(selectedDay)}
              >
                <Plus className="size-4" aria-hidden />
                Ajouter
              </Button>
            </div>

            {selectedJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {agendaCopy.noneThisDay}
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedJobs.map((job) => (
                  <li key={job.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <ScheduledJobCard
                        job={job}
                        onClick={() => openEdit(job)}
                      />
                    </div>
                    {job.status === "planned" || job.status === "in_progress" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 shrink-0"
                        onClick={() => markDone(job)}
                      >
                        Terminé
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {jobs.length === 0 && !loading ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
          <CalendarDays className="mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">{agendaCopy.noneThisPeriod}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {agendaCopy.noneOrganizeHint}
          </p>
          <Button
            type="button"
            className="mt-4 h-11"
            onClick={() => openCreate(selectedDay)}
          >
            {agendaCopy.plan}
          </Button>
        </div>
      ) : null}

      <ScheduledJobFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        clients={clients}
        editingJob={editingJob}
        defaultDate={selectedDay}
        onSaved={upsertJob}
        onArchived={removeJob}
      />
    </div>
  );
}

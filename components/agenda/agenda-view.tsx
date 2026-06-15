"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";

import { ScheduledJobFormSheet } from "@/components/agenda/scheduled-job-form-sheet";
import { ScheduledJobsTable } from "@/components/agenda/scheduled-jobs-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";
import {
  addMonths,
  addWeeks,
  buildMonthGrid,
  endOfMonth,
  endOfWeek,
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
  filterPillInactiveClassName,
  premiumBorderClassName,
  sectionHeadingClassName,
  sectionSubheadingClassName,
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

function sortJobs(jobs: ScheduledJobWithRelations[]): ScheduledJobWithRelations[] {
  return [...jobs].sort((a, b) => {
    if (a.scheduled_date !== b.scheduled_date) {
      return a.scheduled_date.localeCompare(b.scheduled_date);
    }
    const ta = a.scheduled_time ?? "";
    const tb = b.scheduled_time ?? "";
    if (ta !== tb) return ta.localeCompare(tb);
    return a.title.localeCompare(b.title, "fr");
  });
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
  const sortedJobs = useMemo(() => sortJobs(jobs), [jobs]);

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
      return sortJobs(next);
    });
  }

  function removeJob(jobId: string) {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }

  const monthGrid = buildMonthGrid(anchor);
  const selectedJobs = jobsMap.get(selectedDay) ?? [];

  if (jobs.length === 0 && !loading) {
    return (
      <div className="space-y-5">
        <AgendaToolbar
          periodLabel={periodLabel}
          loading={loading}
          viewMode={viewMode}
          onPrev={navigatePrev}
          onNext={navigateNext}
          onToday={goToToday}
          onViewModeChange={setViewMode}
        />
        <EmptyState
          icon={CalendarDays}
          title={agendaCopy.noneThisPeriod}
          description={agendaCopy.noneOrganizeHint}
          actionLabel={agendaCopy.plan}
          actionHref="/agenda?create=1"
        />
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

  return (
    <div className="space-y-5">
      <AgendaToolbar
        periodLabel={periodLabel}
        loading={loading}
        viewMode={viewMode}
        onPrev={navigatePrev}
        onNext={navigateNext}
        onToday={goToToday}
        onViewModeChange={setViewMode}
      />

      {viewMode === "week" ? (
        <ScheduledJobsTable jobs={sortedJobs} onJobClick={openEdit} />
      ) : (
        <div className="space-y-5">
          <div className={cn(surfaceCardClassName, "overflow-hidden")}>
            <div className="grid grid-cols-7 border-b border-[rgba(15,23,42,0.06)] bg-[#f8fafc]/80 text-center text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:border-[rgba(148,163,184,0.12)] dark:bg-[rgba(15,23,42,0.4)] dark:text-[#94a3b8] sm:text-xs">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((label) => (
                <div key={label} className="py-2.5">
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
                      "min-h-[4.5rem] border-b border-r p-1.5 text-left transition-colors sm:min-h-[5.5rem] sm:p-2",
                      premiumBorderClassName,
                      !inMonth && "bg-[#f8fafc]/50 text-[#94a3b8] dark:bg-[rgba(15,23,42,0.35)]",
                      selected &&
                        "bg-[rgba(37,99,235,0.08)] ring-1 ring-inset ring-[rgba(37,99,235,0.2)] dark:bg-[rgba(59,130,246,0.12)]",
                      todayFlag &&
                        !selected &&
                        "bg-[rgba(37,99,235,0.04)] dark:bg-[rgba(59,130,246,0.06)]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold sm:text-sm",
                        todayFlag &&
                          "bg-[#2563eb] text-white dark:bg-[#3b82f6]",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayJobs.length > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        {dayJobs.slice(0, 2).map((job) => (
                          <p
                            key={job.id}
                            className="truncate rounded-md bg-[rgba(37,99,235,0.1)] px-1 py-0.5 text-[9px] font-medium text-[#2563eb] sm:text-[10px] dark:bg-[rgba(59,130,246,0.15)] dark:text-[#93c5fd]"
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
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className={sectionHeadingClassName}>
                  {formatShortDayLabel(parseIsoDate(selectedDay))}
                </h3>
                <p className={cn("mt-0.5", sectionSubheadingClassName)}>
                  {selectedJobs.length === 0
                    ? agendaCopy.noneThisDay
                    : `${selectedJobs.length} rendez-vous`}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-10 shrink-0 gap-1.5"
                onClick={() => openCreate(selectedDay)}
              >
                <Plus className="size-4" aria-hidden />
                Ajouter
              </Button>
            </div>

            {selectedJobs.length === 0 ? (
              <div
                className={cn(
                  surfaceCardClassName,
                  "px-5 py-8 text-center text-sm text-muted-foreground",
                )}
              >
                {agendaCopy.noneThisDay}
              </div>
            ) : (
              <ScheduledJobsTable
                jobs={sortJobs(selectedJobs)}
                onJobClick={openEdit}
              />
            )}
          </section>
        </div>
      )}

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

interface AgendaToolbarProps {
  periodLabel: string;
  loading: boolean;
  viewMode: AgendaViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: AgendaViewMode) => void;
}

function AgendaToolbar({
  periodLabel,
  loading,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: AgendaToolbarProps) {
  return (
    <div className={cn(surfaceCardClassName, "p-4 sm:p-5")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            onClick={onPrev}
            aria-label="Période précédente"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 min-w-0 flex-1 px-3 sm:min-w-[7.5rem] sm:flex-none"
            onClick={onToday}
          >
            Aujourd&apos;hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0"
            onClick={onNext}
            aria-label="Période suivante"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>

        <p className="text-center text-sm font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-base">
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
              viewMode === "week"
                ? filterPillActiveClassName
                : filterPillInactiveClassName,
              "flex-1 sm:flex-none",
            )}
            onClick={() => onViewModeChange("week")}
          >
            Semaine
          </button>
          <button
            type="button"
            className={cn(
              filterPillClassName,
              viewMode === "month"
                ? filterPillActiveClassName
                : filterPillInactiveClassName,
              "flex-1 sm:flex-none",
            )}
            onClick={() => onViewModeChange("month")}
          >
            Mois
          </button>
        </div>
      </div>
    </div>
  );
}

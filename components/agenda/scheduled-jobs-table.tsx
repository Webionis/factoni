"use client";

import { ChevronRight } from "lucide-react";

import { ScheduledJobStatusBadge } from "@/components/agenda/scheduled-job-status-badge";
import {
  scheduledJobClientLabel,
  scheduledJobLocationLabel,
  type ScheduledJobWithRelations,
} from "@/lib/data/scheduled-jobs";
import { formatShortDayLabel, parseIsoDate } from "@/lib/dates/calendar-range";
import { formatScheduledJobTime } from "@/lib/scheduled-jobs/status";
import {
  dataTableElementClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
  dataTableScrollWrapperClassName,
  interactiveRowClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ScheduledJobsTableProps {
  jobs: ScheduledJobWithRelations[];
  onJobClick: (job: ScheduledJobWithRelations) => void;
}

export function ScheduledJobsTable({
  jobs,
  onJobClick,
}: ScheduledJobsTableProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className={dataTableScrollWrapperClassName}>
      <table className={dataTableElementClassName}>
        <thead>
          <tr>
            <th className={cn(dataTableHeadClassName, "px-5 py-3")}>Date</th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 sm:table-cell")}>
              Heure
            </th>
            <th className={cn(dataTableHeadClassName, "px-4 py-3")}>Rendez-vous</th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 lg:table-cell")}>
              Client
            </th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 xl:table-cell")}>
              Lieu
            </th>
            <th className={cn(dataTableHeadClassName, "px-4 py-3")}>Statut</th>
            <th className={cn(dataTableHeadClassName, "w-10 px-3 py-3")}>
              <span className="sr-only">Ouvrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const clientLabel = scheduledJobClientLabel(job);
            const locationLabel = scheduledJobLocationLabel(job);
            const timeLabel = formatScheduledJobTime(job.scheduled_time);

            return (
              <tr
                key={job.id}
                className={cn(dataTableRowClassName, interactiveRowClassName, "cursor-pointer")}
                onClick={() => onJobClick(job)}
              >
                <td className="px-5 py-3.5 text-[13px] font-medium capitalize text-[#475569] dark:text-[#94a3b8]">
                  {formatShortDayLabel(parseIsoDate(job.scheduled_date))}
                </td>
                <td className="hidden px-4 py-3.5 tabular-nums text-[#64748b] sm:table-cell dark:text-[#94a3b8]">
                  {timeLabel ?? "—"}
                </td>
                <td className="max-w-[220px] px-4 py-3.5">
                  <span className="font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
                    {job.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#94a3b8] sm:hidden">
                    {timeLabel ? `${timeLabel} · ` : ""}
                    {clientLabel ?? "Sans client"}
                  </span>
                </td>
                <td className="hidden max-w-[160px] truncate px-4 py-3.5 text-[#64748b] lg:table-cell dark:text-[#94a3b8]">
                  {clientLabel ?? "—"}
                </td>
                <td className="hidden max-w-[140px] truncate px-4 py-3.5 text-[#64748b] xl:table-cell dark:text-[#94a3b8]">
                  {locationLabel ?? "—"}
                </td>
                <td className="px-4 py-3.5">
                  <ScheduledJobStatusBadge status={job.status} />
                </td>
                <td className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick(job);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#2563eb] dark:hover:bg-white/5 dark:hover:text-[#93c5fd]"
                    aria-label={`Ouvrir ${job.title}`}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

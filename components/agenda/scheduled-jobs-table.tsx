"use client";

import { ChevronRight } from "lucide-react";

import { ScheduledJobStatusBadge } from "@/components/agenda/scheduled-job-status-badge";
import {
  scheduledJobClientLabel,
  scheduledJobLocationLabel,
  type ScheduledJobWithRelations,
} from "@/lib/data/scheduled-jobs";
import {
  formatAgendaTableDateParts,
  formatShortDayLabel,
  parseIsoDate,
} from "@/lib/dates/calendar-range";
import { formatScheduledJobTime } from "@/lib/scheduled-jobs/status";
import {
  dataTableContainedElementClassName,
  dataTableContainedWrapperClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
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
    <div className={dataTableContainedWrapperClassName}>
      <table className={dataTableContainedElementClassName}>
        <thead>
          <tr>
            <th
              className={cn(
                dataTableHeadClassName,
                "w-[30%] px-3 py-3 sm:w-[14%] sm:px-5",
              )}
            >
              Date
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden w-[10%] px-3 py-3 sm:table-cell",
              )}
            >
              Heure
            </th>
            <th className={cn(dataTableHeadClassName, "px-2 py-3 sm:px-4")}>
              Rendez-vous
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden w-[16%] px-3 py-3 lg:table-cell",
              )}
            >
              Client
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden w-[14%] px-3 py-3 xl:table-cell",
              )}
            >
              Lieu
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "w-[34%] whitespace-nowrap px-2 py-3 sm:w-[14%] sm:px-3",
              )}
            >
              Statut
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden w-10 px-3 py-3 sm:table-cell",
              )}
            >
              <span className="sr-only">Ouvrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const clientLabel = scheduledJobClientLabel(job);
            const locationLabel = scheduledJobLocationLabel(job);
            const timeLabel = formatScheduledJobTime(job.scheduled_time);
            const jobDate = parseIsoDate(job.scheduled_date);
            const mobileDate = formatAgendaTableDateParts(jobDate);

            return (
              <tr
                key={job.id}
                className={cn(
                  dataTableRowClassName,
                  interactiveRowClassName,
                  "cursor-pointer",
                )}
                onClick={() => onJobClick(job)}
              >
                <td className="px-3 py-3.5 align-top sm:px-5">
                  <div className="sm:hidden">
                    <span className="block text-[11px] font-semibold capitalize leading-tight text-[#64748b] dark:text-[#94a3b8]">
                      {mobileDate.weekday}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-semibold capitalize leading-tight text-[#0f172a] dark:text-[#f8fafc]">
                      {mobileDate.dayMonth}
                    </span>
                  </div>
                  <span className="hidden text-[13px] font-medium capitalize text-[#475569] sm:block dark:text-[#94a3b8]">
                    {formatShortDayLabel(jobDate)}
                  </span>
                </td>
                <td className="hidden px-3 py-3.5 tabular-nums text-[#64748b] sm:table-cell dark:text-[#94a3b8]">
                  <span className="block truncate">{timeLabel ?? "—"}</span>
                </td>
                <td className="min-w-0 px-2 py-3.5 sm:px-4">
                  <span className="block truncate font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
                    {job.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#94a3b8] sm:hidden">
                    {timeLabel ? `${timeLabel} · ` : ""}
                    {clientLabel ?? "Sans client"}
                  </span>
                </td>
                <td className="hidden min-w-0 px-3 py-3.5 text-[#64748b] lg:table-cell dark:text-[#94a3b8]">
                  <span className="block truncate">{clientLabel ?? "—"}</span>
                </td>
                <td className="hidden min-w-0 px-3 py-3.5 text-[#64748b] xl:table-cell dark:text-[#94a3b8]">
                  <span className="block truncate">{locationLabel ?? "—"}</span>
                </td>
                <td className="px-2 py-3.5 sm:px-3">
                  <ScheduledJobStatusBadge
                    status={job.status}
                    compact
                    className="max-w-full"
                  />
                </td>
                <td className="hidden px-3 py-3.5 sm:table-cell">
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

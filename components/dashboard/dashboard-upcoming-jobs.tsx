import Link from "next/link";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";

import { agendaCopy } from "@/lib/agenda/copy";
import { ScheduledJobCard } from "@/components/agenda/scheduled-job-card";
import { buttonVariants } from "@/components/ui/button";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";
import { formatShortDayLabel, parseIsoDate } from "@/lib/dates/calendar-range";
import {
  fadeInUpClassName,
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface DashboardUpcomingJobsProps {
  jobs: ScheduledJobWithRelations[];
  /** Vue dashboard colonne gauche : liste limitée, carte compacte. */
  compact?: boolean;
}

const COMPACT_JOB_LIMIT = 4;

export function DashboardUpcomingJobs({
  jobs,
  compact = false,
}: DashboardUpcomingJobsProps) {
  const visibleJobs = compact ? jobs.slice(0, COMPACT_JOB_LIMIT) : jobs;
  const hasMoreJobs = compact && jobs.length > COMPACT_JOB_LIMIT;

  return (
    <section
      className={cn(
        surfaceCardClassName,
        fadeInUpClassName,
        "p-5 sm:p-6",
      )}
      style={{ animationDelay: "180ms" }}
      aria-labelledby="upcoming-jobs-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="upcoming-jobs-heading" className={sectionHeadingClassName}>
            {agendaCopy.upcomingSection}
          </h2>
          <p className={cn("mt-0.5", sectionSubheadingClassName)}>
            Vos prochains rendez-vous planifiés dans l&apos;agenda.
          </p>
        </div>
        <Link
          href="/agenda"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-9 gap-1 px-2",
          )}
        >
          Agenda
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {visibleJobs.length === 0 ? (
        <div
          className={cn(
            "mt-4 rounded-xl border border-dashed bg-muted/15 text-center",
            compact ? "px-4 py-5" : "px-5 py-8",
          )}
        >
          <CalendarDays
            className={cn(
              "mx-auto text-muted-foreground",
              compact ? "mb-2 size-7" : "mb-3 size-8",
            )}
            aria-hidden
          />
          <p className="text-sm font-medium">{agendaCopy.nonePlanned}</p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {agendaCopy.noneDashboardHint}
          </p>
          <Link
            href="/agenda?create=1"
            className={cn(
              buttonVariants({ size: compact ? "sm" : "default" }),
              "mt-3 inline-flex gap-1.5",
              compact ? "h-9" : "h-11",
            )}
          >
            <Plus className="size-4" aria-hidden />
            {agendaCopy.plan}
          </Link>
        </div>
      ) : (
        <>
          <ul className={cn("mt-4", compact ? "space-y-2.5" : "space-y-3")}>
            {visibleJobs.map((job) => (
              <li key={job.id}>
                <Link href="/agenda" className="block">
                  <div className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                    {formatShortDayLabel(parseIsoDate(job.scheduled_date))}
                  </div>
                  <ScheduledJobCard job={job} compact />
                </Link>
              </li>
            ))}
          </ul>
          {hasMoreJobs ? (
            <Link
              href="/agenda"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-2 h-9 w-full justify-center text-muted-foreground",
              )}
            >
              +{jobs.length - COMPACT_JOB_LIMIT} autre
              {jobs.length - COMPACT_JOB_LIMIT > 1 ? "s" : ""} rendez-vous
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}

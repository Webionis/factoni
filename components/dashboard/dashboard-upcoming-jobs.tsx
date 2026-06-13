import Link from "next/link";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";

import { agendaCopy } from "@/lib/agenda/copy";
import { ScheduledJobCard } from "@/components/agenda/scheduled-job-card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";
import { formatShortDayLabel, parseIsoDate } from "@/lib/dates/calendar-range";
import { sectionHeadingClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface DashboardUpcomingJobsProps {
  jobs: ScheduledJobWithRelations[];
}

export function DashboardUpcomingJobs({ jobs }: DashboardUpcomingJobsProps) {
  return (
    <section className="space-y-4" aria-labelledby="upcoming-jobs-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="upcoming-jobs-heading" className={sectionHeadingClassName}>
          {agendaCopy.upcomingSection}
        </h2>
        <Link
          href="/agenda"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-10 gap-1 px-2",
          )}
        >
          Agenda
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/15 px-5 py-8 text-center">
          <CalendarDays
            className="mx-auto mb-3 size-8 text-muted-foreground"
            aria-hidden
          />
          <p className="font-medium">{agendaCopy.nonePlanned}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {agendaCopy.noneDashboardHint}
          </p>
          <Link
            href="/agenda?create=1"
            className={cn(buttonVariants(), "mt-4 inline-flex h-11 gap-1.5")}
          >
            <Plus className="size-4" aria-hidden />
            {agendaCopy.plan}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href="/agenda" className="block">
                <div className="mb-1.5 text-xs font-medium text-muted-foreground capitalize">
                  {formatShortDayLabel(parseIsoDate(job.scheduled_date))}
                </div>
                <ScheduledJobCard job={job} compact />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

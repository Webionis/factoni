"use client";

import { ChevronRight, Clock, MapPin, User } from "lucide-react";

import { ScheduledJobStatusBadge } from "@/components/agenda/scheduled-job-status-badge";
import {
  type ScheduledJobWithRelations,
  scheduledJobClientLabel,
  scheduledJobLocationLabel,
} from "@/lib/data/scheduled-jobs";
import { formatScheduledJobTime } from "@/lib/scheduled-jobs/status";
import { surfaceCardInteractiveClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ScheduledJobCardProps {
  job: ScheduledJobWithRelations;
  onClick?: () => void;
  compact?: boolean;
}

export function ScheduledJobCard({
  job,
  onClick,
  compact = false,
}: ScheduledJobCardProps) {
  const clientLabel = scheduledJobClientLabel(job);
  const locationLabel = scheduledJobLocationLabel(job);
  const timeLabel = formatScheduledJobTime(job.scheduled_time);

  const content = (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "min-w-0 font-semibold leading-snug tracking-tight break-words",
              compact ? "text-[13px] sm:text-sm" : "text-sm sm:text-[15px]",
            )}
          >
            {job.title}
          </p>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <ScheduledJobStatusBadge status={job.status} />
          </div>
        </div>

        <div
          className={cn(
            "mt-1.5 space-y-0.5 text-[13px] text-muted-foreground",
            compact && "mt-1",
          )}
        >
          {timeLabel ? (
            <p className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {timeLabel}
            </p>
          ) : null}
          {clientLabel ? (
            <p className="flex items-center gap-1.5">
              <User className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{clientLabel}</span>
            </p>
          ) : null}
          {locationLabel && !compact ? (
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 break-words">{locationLabel}</span>
            </p>
          ) : null}
        </div>
      </div>
      {onClick ? (
        <ChevronRight
          className="mt-1 hidden size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
          aria-hidden
        />
      ) : null}
    </div>
  );

  if (!onClick) {
    return (
      <article
        className={cn(
          surfaceCardInteractiveClassName,
          "p-3.5 sm:p-4",
        )}
      >
        {content}
      </article>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group block w-full touch-manipulation text-left",
        surfaceCardInteractiveClassName,
        "p-3.5 transition-transform duration-150 active:scale-[0.99] sm:p-4",
      )}
    >
      {content}
    </button>
  );
}

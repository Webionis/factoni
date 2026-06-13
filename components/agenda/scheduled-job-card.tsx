"use client";

import { Clock, MapPin, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  type ScheduledJobWithRelations,
  scheduledJobClientLabel,
  scheduledJobLocationLabel,
} from "@/lib/data/scheduled-jobs";
import {
  formatScheduledJobTime,
  SCHEDULED_JOB_STATUS_LABELS,
} from "@/lib/scheduled-jobs/status";
import { surfaceCardInteractiveClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ScheduledJobCardProps {
  job: ScheduledJobWithRelations;
  onClick?: () => void;
  compact?: boolean;
}

function statusVariant(
  status: ScheduledJobWithRelations["status"],
): "secondary" | "default" | "outline" {
  switch (status) {
    case "in_progress":
      return "default";
    case "done":
      return "secondary";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
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
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "min-w-0 font-semibold leading-snug break-words",
            compact ? "text-sm" : "text-[15px]",
          )}
        >
          {job.title}
        </p>
        <Badge
          variant={statusVariant(job.status)}
          className="shrink-0 text-[10px]"
        >
          {SCHEDULED_JOB_STATUS_LABELS[job.status]}
        </Badge>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground sm:text-sm">
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
        {locationLabel ? (
          <p className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">{locationLabel}</span>
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!onClick) {
    return (
      <article
        className={cn(
          "rounded-xl border bg-card p-3.5 sm:p-4",
          surfaceCardInteractiveClassName.replace("cursor-pointer", ""),
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
        "w-full rounded-xl border bg-card p-3.5 text-left sm:p-4",
        surfaceCardInteractiveClassName,
      )}
    >
      {content}
    </button>
  );
}

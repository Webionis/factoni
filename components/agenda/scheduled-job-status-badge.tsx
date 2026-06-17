import { Badge } from "@/components/ui/badge";
import { SCHEDULED_JOB_STATUS_LABELS } from "@/lib/scheduled-jobs/status";
import type { ScheduledJobStatus } from "@/lib/validations/scheduled-job";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  ScheduledJobStatus,
  { className: string; dot: string }
> = {
  planned: {
    className:
      "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#1e3a8a]/55 dark:text-[#93c5fd]",
    dot: "bg-[#3b82f6] dark:bg-[#60a5fa]",
  },
  in_progress: {
    className:
      "bg-[#fffbeb] text-[#b45309] dark:bg-[#78350f]/45 dark:text-[#fcd34d]",
    dot: "bg-[#f59e0b] dark:bg-[#fbbf24]",
  },
  done: {
    className:
      "bg-[#ecfdf5] text-[#047857] dark:bg-[#14532d]/50 dark:text-[#86efac]",
    dot: "bg-[#10b981] dark:bg-[#4ade80]",
  },
  cancelled: {
    className:
      "bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800/80 dark:text-slate-300",
    dot: "bg-[#94a3b8] dark:bg-slate-400",
  },
};

interface ScheduledJobStatusBadgeProps {
  status: ScheduledJobStatus;
  className?: string;
  compact?: boolean;
}

export function ScheduledJobStatusBadge({
  status,
  className,
  compact = false,
}: ScheduledJobStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.planned;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 max-w-full gap-1.5 rounded-lg border-0 px-2.5 text-xs font-medium",
        compact && "h-5 gap-1 px-1.5 text-[10px] sm:h-6 sm:gap-1.5 sm:px-2.5 sm:text-xs",
        styles.className,
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", styles.dot)}
        aria-hidden
      />
      <span className="truncate">
        {SCHEDULED_JOB_STATUS_LABELS[status] ?? status}
      </span>
    </Badge>
  );
}

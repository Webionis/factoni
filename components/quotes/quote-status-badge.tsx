import { Badge } from "@/components/ui/badge";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_SHORT_LABELS,
  type QuoteStatus,
} from "@/lib/quotes/status";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  QuoteStatus,
  { className: string; dot: string }
> = {
  draft: {
    className:
      "bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800/80 dark:text-slate-300",
    dot: "bg-[#94a3b8] dark:bg-slate-400",
  },
  ready: {
    className:
      "bg-[#eef2ff] text-[#4338ca] dark:bg-[#312e81]/55 dark:text-[#a5b4fc]",
    dot: "bg-[#6366f1] dark:bg-[#818cf8]",
  },
  sent: {
    className:
      "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#1e3a8a]/55 dark:text-[#93c5fd]",
    dot: "bg-[#3b82f6] dark:bg-[#60a5fa]",
  },
  viewed: {
    className:
      "bg-[#f0f9ff] text-[#0369a1] dark:bg-[#0c4a6e]/50 dark:text-[#7dd3fc]",
    dot: "bg-[#0ea5e9] dark:bg-[#38bdf8]",
  },
  accepted: {
    className:
      "bg-[#ecfdf5] text-[#047857] dark:bg-[#14532d]/50 dark:text-[#86efac]",
    dot: "bg-[#10b981] dark:bg-[#4ade80]",
  },
  deposit_requested: {
    className:
      "bg-[#fff7ed] text-[#c2410c] dark:bg-[#7c2d12]/45 dark:text-[#fdba74]",
    dot: "bg-[#f97316] dark:bg-[#fb923c]",
  },
  deposit_paid: {
    className:
      "bg-[#ecfdf5] text-[#047857] dark:bg-[#14532d]/50 dark:text-[#86efac]",
    dot: "bg-[#10b981] dark:bg-[#4ade80]",
  },
  invoiced: {
    className:
      "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#1e3a8a]/55 dark:text-[#93c5fd]",
    dot: "bg-[#3b82f6] dark:bg-[#60a5fa]",
  },
  rejected: {
    className:
      "bg-[#fef2f2] text-[#b91c1c] dark:bg-[#7f1d1d]/45 dark:text-[#fca5a5]",
    dot: "bg-[#ef4444] dark:bg-[#f87171]",
  },
  expired: {
    className:
      "bg-[#fffbeb] text-[#b45309] dark:bg-[#78350f]/45 dark:text-[#fcd34d]",
    dot: "bg-[#f59e0b] dark:bg-[#fbbf24]",
  },
  cancelled: {
    className:
      "bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800/80 dark:text-slate-400",
    dot: "bg-[#94a3b8] dark:bg-slate-500",
  },
};

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  className?: string;
  compact?: boolean;
}

export function QuoteStatusBadge({
  status,
  className,
  compact = false,
}: QuoteStatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.draft;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 gap-1.5 rounded-lg border-0 px-2.5 text-xs font-medium",
        styles.className,
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", styles.dot)}
        aria-hidden
      />
      {compact ? (
        <>
          <span className="md:hidden">{QUOTE_STATUS_SHORT_LABELS[status] ?? status}</span>
          <span className="hidden md:inline">
            {QUOTE_STATUS_LABELS[status] ?? status}
          </span>
        </>
      ) : (
        (QUOTE_STATUS_LABELS[status] ?? status)
      )}
    </Badge>
  );
}

import {
  PORTAL_STATUS_TONES,
  type PortalClientStatus,
  type PortalStatusTone,
} from "@/lib/client-portal/status";
import { cn } from "@/lib/utils";

export function portalStatusBadgeClassName(tone: PortalStatusTone): string {
  switch (tone) {
    case "action":
      return "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200/80 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-800/50";
    case "warning":
      return "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200/80 dark:bg-amber-950/35 dark:text-amber-200 dark:ring-amber-800/50";
    case "danger":
      return "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200/80 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/50";
    case "success":
      return "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/50";
    case "muted":
    default:
      return "bg-muted/80 text-muted-foreground ring-1 ring-inset ring-border/60";
  }
}

interface PortalStatusBadgeProps {
  status: PortalClientStatus;
  label: string;
  className?: string;
}

export function PortalStatusBadge({
  status,
  label,
  className,
}: PortalStatusBadgeProps) {
  const tone = PORTAL_STATUS_TONES[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none sm:text-xs",
        portalStatusBadgeClassName(tone),
        className,
      )}
    >
      {label}
    </span>
  );
}

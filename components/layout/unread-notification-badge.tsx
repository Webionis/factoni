import { cn } from "@/lib/utils";

function formatBadgeLabel(count: number): string {
  if (count > 9) return "9+";
  return String(count);
}

function unreadAriaLabel(count: number): string {
  if (count > 9) return "9 notifications non lues ou plus";
  if (count === 1) return "1 notification non lue";
  return `${count} notifications non lues`;
}

interface UnreadNotificationBadgeProps {
  count: number;
  className?: string;
}

export function UnreadNotificationBadge({
  count,
  className,
}: UnreadNotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white",
        "motion-safe:animate-[ff-fade-in-up_0.35s_ease-out_both]",
        "dark:bg-[#3b82f6]",
        className,
      )}
      aria-label={unreadAriaLabel(count)}
    >
      {formatBadgeLabel(count)}
    </span>
  );
}

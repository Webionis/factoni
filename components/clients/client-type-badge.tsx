import { Badge } from "@/components/ui/badge";
import type { ClientRow } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<
  ClientRow["client_type"],
  { className: string; dot: string; label: string }
> = {
  company: {
    className:
      "bg-[#eef2ff] text-[#4338ca] dark:bg-[#312e81]/55 dark:text-[#a5b4fc]",
    dot: "bg-[#6366f1] dark:bg-[#818cf8]",
    label: "Professionnel",
  },
  individual: {
    className:
      "bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800/80 dark:text-slate-300",
    dot: "bg-[#94a3b8] dark:bg-slate-400",
    label: "Particulier",
  },
};

interface ClientTypeBadgeProps {
  type: ClientRow["client_type"];
  short?: boolean;
  className?: string;
}

export function ClientTypeBadge({
  type,
  short = false,
  className,
}: ClientTypeBadgeProps) {
  const styles = TYPE_STYLES[type] ?? TYPE_STYLES.individual;

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
      {short
        ? type === "company"
          ? "Pro"
          : "Part."
        : styles.label}
    </Badge>
  );
}

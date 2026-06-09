import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InvoiceArchivedBadgeProps {
  className?: string;
}

export function InvoiceArchivedBadge({ className }: InvoiceArchivedBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 rounded-lg border-0 bg-slate-500/10 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300",
        className,
      )}
    >
      Archivée
    </Badge>
  );
}

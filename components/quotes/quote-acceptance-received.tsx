import { CheckCircle2 } from "lucide-react";

import { formatFrenchDateTime } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

interface QuoteAcceptanceReceivedProps {
  acceptedAt: string | null;
  className?: string;
}

export function QuoteAcceptanceReceived({
  acceptedAt,
  className,
}: QuoteAcceptanceReceivedProps) {
  const formatted = acceptedAt ? formatFrenchDateTime(acceptedAt) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-2.5 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/30",
        className,
      )}
    >
      <CheckCircle2
        className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
        aria-hidden
      />
      <p className="leading-relaxed text-emerald-950 dark:text-emerald-50">
        {formatted ? (
          <>
            Devis signé le <span className="font-medium">{formatted}</span>
          </>
        ) : (
          "Devis accepté"
        )}
      </p>
    </div>
  );
}

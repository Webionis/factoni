import { Badge } from "@/components/ui/badge";
import type { InvoiceLineItemNature } from "@/lib/invoices/item-nature";
import { invoiceLineItemNatureLabel } from "@/lib/invoices/item-nature";
import { cn } from "@/lib/utils";

const NATURE_STYLES: Record<
  InvoiceLineItemNature,
  { className: string; dot: string }
> = {
  service: {
    className:
      "bg-[#eff6ff] text-[#1d4ed8] dark:bg-[#1e3a8a]/55 dark:text-[#93c5fd]",
    dot: "bg-[#2563eb] dark:bg-[#60a5fa]",
  },
  merchandise: {
    className:
      "bg-[#fffbeb] text-[#b45309] dark:bg-[#78350f]/55 dark:text-[#fcd34d]",
    dot: "bg-[#f59e0b] dark:bg-[#fbbf24]",
  },
  finished_product: {
    className:
      "bg-[#ecfdf5] text-[#047857] dark:bg-[#064e3b]/55 dark:text-[#6ee7b7]",
    dot: "bg-[#10b981] dark:bg-[#34d399]",
  },
  artist_author: {
    className:
      "bg-[#f5f3ff] text-[#6d28d9] dark:bg-[#4c1d95]/55 dark:text-[#c4b5fd]",
    dot: "bg-[#8b5cf6] dark:bg-[#a78bfa]",
  },
  disbursement: {
    className:
      "bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800/80 dark:text-slate-300",
    dot: "bg-[#94a3b8] dark:bg-slate-400",
  },
};

interface CatalogItemNatureBadgeProps {
  nature: InvoiceLineItemNature;
  short?: boolean;
  className?: string;
}

export function CatalogItemNatureBadge({
  nature,
  short = false,
  className,
}: CatalogItemNatureBadgeProps) {
  const styles = NATURE_STYLES[nature] ?? NATURE_STYLES.service;
  const label = invoiceLineItemNatureLabel(nature);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 max-w-full gap-1.5 rounded-lg border-0 px-2.5 text-xs font-medium",
        styles.className,
        className,
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", styles.dot)}
        aria-hidden
      />
      <span className="truncate">
        {short
          ? nature === "disbursement"
            ? "Débours"
            : nature === "artist_author"
              ? "Artiste"
              : nature === "finished_product"
                ? "Produit"
                : nature === "merchandise"
                  ? "March."
                  : "Service"
          : label}
      </span>
    </Badge>
  );
}

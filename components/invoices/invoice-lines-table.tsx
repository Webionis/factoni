import { formatCurrency } from "@/lib/invoices/calculate";
import type { InvoiceLineRow } from "@/lib/data/invoices";
import { cn } from "@/lib/utils";
import {
  dataTableHeadClassName,
  dataTableRowClassName,
} from "@/lib/constants/ui";

interface InvoiceLinesTableProps {
  lines: InvoiceLineRow[];
  className?: string;
}

export function InvoiceLinesTable({ lines, className }: InvoiceLinesTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr>
            <th className={cn(dataTableHeadClassName, "px-0 py-2.5")}>
              Description
            </th>
            <th className={cn(dataTableHeadClassName, "w-20 px-3 py-2.5 text-right")}>
              Qté
            </th>
            <th className={cn(dataTableHeadClassName, "w-28 px-3 py-2.5 text-right")}>
              PU HT
            </th>
            <th className={cn(dataTableHeadClassName, "w-20 px-3 py-2.5 text-right")}>
              TVA
            </th>
            <th className={cn(dataTableHeadClassName, "w-28 px-0 py-2.5 text-right")}>
              Total TTC
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className={cn(dataTableRowClassName, "border-0")}>
              <td className="px-0 py-3.5 font-medium">{line.description}</td>
              <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground">
                {Number(line.quantity)}
              </td>
              <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground">
                {formatCurrency(Number(line.unit_price_ht))}
              </td>
              <td className="px-3 py-3.5 text-right tabular-nums text-muted-foreground">
                {Number(line.vat_rate)} %
              </td>
              <td className="px-0 py-3.5 text-right font-semibold tabular-nums">
                {formatCurrency(Number(line.line_total_ttc))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-border/50 md:hidden">
        {lines.map((line) => (
          <li key={line.id} className="py-4 first:pt-0 last:pb-0">
            <p className="font-medium">{line.description}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {Number(line.quantity)} × {formatCurrency(Number(line.unit_price_ht))} HT
              {" · "}TVA {Number(line.vat_rate)} %
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums">
              {formatCurrency(Number(line.line_total_ttc))} TTC
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { InvoiceArchivedBadge } from "@/components/invoices/invoice-archived-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { isInvoiceArchived } from "@/lib/invoices/archive";
import { formatCurrency } from "@/lib/invoices/calculate";
import {
  clientNameFromInvoice,
  clientNameFromSnapshot,
  type InvoiceWithClient,
} from "@/lib/data/invoices";
import { isInvoiceDocument } from "@/lib/documents/types";
import { getEffectiveInvoiceStatus } from "@/lib/invoices/overdue";
import { invoiceDisplayNumber, toInvoiceStatus } from "@/lib/invoices/status";
import {
  dataTableElementClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
  dataTableScrollWrapperClassName,
  dataTableStatusBadgeClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface InvoicesTableProps {
  invoices: InvoiceWithClient[];
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  return (
    <div className={dataTableScrollWrapperClassName}>
      <table className={dataTableElementClassName}>
        <thead>
          <tr>
            <th
              className={cn(
                dataTableHeadClassName,
                "px-5 py-3 max-md:w-[24%] max-md:px-3",
              )}
            >
              N°
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "px-4 py-3 max-md:w-[28%] max-md:px-2",
              )}
            >
              Client
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden px-4 py-3 lg:table-cell",
              )}
            >
              Échéance
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "px-4 py-3 text-right max-md:w-[22%] max-md:px-2",
              )}
            >
              Montant TTC
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "px-4 py-3 max-md:w-[26%] max-md:whitespace-nowrap max-md:px-2 max-md:pr-3",
              )}
            >
              Statut
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "hidden w-10 px-3 py-3 sm:table-cell",
              )}
            >
              <span className="sr-only">Ouvrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            if (!isInvoiceDocument(invoice.document_type)) return null;

            const displayStatus = getEffectiveInvoiceStatus(
              toInvoiceStatus(invoice.status),
              invoice.due_date,
            );
            const clientLabel =
              clientNameFromSnapshot(invoice.client_snapshot) ??
              clientNameFromInvoice(invoice);
            const archived = isInvoiceArchived(invoice.archived_at);
            const number = invoiceDisplayNumber(
              invoice.invoice_number,
              invoice.id,
            );

            return (
              <tr key={invoice.id} className={dataTableRowClassName}>
                <td className="px-5 py-3.5 max-md:px-3">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block font-mono text-[13px] font-semibold tracking-tight text-[#0f172a] hover:text-[#2563eb] max-md:text-[11px] dark:text-[#f8fafc] dark:hover:text-[#93c5fd]"
                  >
                    {number}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3.5 text-[#475569] max-md:max-w-0 max-md:overflow-hidden max-md:text-ellipsis max-md:whitespace-nowrap max-md:px-2 dark:text-[#94a3b8]">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block truncate hover:text-[#0f172a] dark:hover:text-[#f8fafc]"
                  >
                    {clientLabel}
                  </Link>
                </td>
                <td className="hidden px-4 py-3.5 tabular-nums text-[#64748b] lg:table-cell dark:text-[#94a3b8]">
                  {formatDate(invoice.due_date)}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums tracking-tight max-md:whitespace-nowrap max-md:px-2 max-md:text-[12px]">
                  {formatCurrency(Number(invoice.total_ttc))}
                </td>
                <td className="px-4 py-3.5 max-md:whitespace-nowrap max-md:px-2 max-md:pr-3">
                  <div className="flex flex-wrap items-center gap-1.5 max-md:flex-nowrap">
                    {archived ? (
                      <InvoiceArchivedBadge
                        className={dataTableStatusBadgeClassName}
                      />
                    ) : null}
                    <InvoiceStatusBadge
                      status={displayStatus}
                      compact
                      className={dataTableStatusBadgeClassName}
                    />
                  </div>
                </td>
                <td className="hidden px-3 py-3.5 sm:table-cell">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#2563eb] dark:hover:bg-white/5 dark:hover:text-[#93c5fd]"
                    aria-label={`Ouvrir ${number}`}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ClientTypeBadge } from "@/components/clients/client-type-badge";
import {
  clientDisplayName,
  clientSubtitle,
  type ClientRow,
} from "@/lib/validations/client";
import {
  dataTableElementClassName,
  dataTableHeadClassName,
  dataTableRowClassName,
  dataTableScrollWrapperClassName,
  interactiveRowClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ClientsTableProps {
  clients: ClientRow[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <div className={dataTableScrollWrapperClassName}>
      <table className={cn(dataTableElementClassName, "md:min-w-[38rem]")}>
        <thead>
          <tr>
            <th className={cn(dataTableHeadClassName, "px-5 py-3")}>Client</th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 lg:table-cell")}>
              Contact
            </th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 md:table-cell")}>
              Email
            </th>
            <th className={cn(dataTableHeadClassName, "hidden px-4 py-3 xl:table-cell")}>
              Téléphone
            </th>
            <th
              className={cn(
                dataTableHeadClassName,
                "px-4 py-3 max-md:w-[18%] max-md:whitespace-nowrap max-md:px-2 max-md:pr-4",
              )}
            >
              Type
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
          {clients.map((client) => {
            const subtitle = clientSubtitle(client);
            const contactLine = [client.email, client.phone]
              .filter(Boolean)
              .join(" · ");

            return (
              <tr
                key={client.id}
                className={cn(
                  dataTableRowClassName,
                  interactiveRowClassName,
                  "cursor-pointer",
                )}
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/clients/${client.id}`}
                    className="block min-w-0"
                  >
                    <span className="font-semibold tracking-tight text-[#0f172a] hover:text-[#2563eb] dark:text-[#f8fafc] dark:hover:text-[#93c5fd]">
                      {clientDisplayName(client)}
                    </span>
                    {subtitle ? (
                      <span className="mt-0.5 block truncate text-xs text-[#94a3b8] lg:hidden">
                        {subtitle}
                      </span>
                    ) : null}
                    {contactLine ? (
                      <span className="mt-0.5 block truncate text-xs text-[#94a3b8] md:hidden">
                        {contactLine}
                      </span>
                    ) : null}
                  </Link>
                </td>
                <td className="hidden max-w-[160px] truncate px-4 py-3.5 text-[#64748b] lg:table-cell dark:text-[#94a3b8]">
                  <Link
                    href={`/clients/${client.id}`}
                    className="block truncate hover:text-[#0f172a] dark:hover:text-[#f8fafc]"
                  >
                    {subtitle ?? "—"}
                  </Link>
                </td>
                <td className="hidden max-w-[200px] truncate px-4 py-3.5 text-[#64748b] md:table-cell dark:text-[#94a3b8]">
                  <Link
                    href={`/clients/${client.id}`}
                    className="block truncate hover:text-[#0f172a] dark:hover:text-[#f8fafc]"
                  >
                    {client.email ?? "—"}
                  </Link>
                </td>
                <td className="hidden px-4 py-3.5 tabular-nums text-[#64748b] xl:table-cell dark:text-[#94a3b8]">
                  {client.phone ?? "—"}
                </td>
                <td className="px-4 py-3.5 max-md:whitespace-nowrap max-md:px-2 max-md:pr-4">
                  <ClientTypeBadge type={client.client_type} short />
                </td>
                <td className="hidden px-3 py-3.5 sm:table-cell">
                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#2563eb] dark:hover:bg-white/5 dark:hover:text-[#93c5fd]"
                    aria-label={`Ouvrir ${clientDisplayName(client)}`}
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

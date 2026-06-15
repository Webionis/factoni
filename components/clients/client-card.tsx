import Link from "next/link";
import { Building2, ChevronRight, User } from "lucide-react";

import { ClientTypeBadge } from "@/components/clients/client-type-badge";
import type { ClientRow } from "@/lib/validations/client";
import {
  clientDisplayName,
  clientSubtitle,
} from "@/lib/validations/client";
import { mobileListCardChevronClassName } from "@/lib/constants/mobile";
import { mobileListCardClassName } from "@/lib/constants/ui";

interface ClientCardProps {
  client: ClientRow;
}

export function ClientCard({ client }: ClientCardProps) {
  const subtitle = clientSubtitle(client);
  const contact = [client.email, client.phone].filter(Boolean).join(" · ");

  return (
    <Link href={`/clients/${client.id}`} className="block group">
      <article className={mobileListCardClassName}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb] ring-1 ring-inset ring-[#2563eb]/10 sm:size-12 sm:rounded-2xl"
            aria-hidden
          >
            {client.client_type === "company" ? (
              <Building2 className="size-4 sm:size-5" />
            ) : (
              <User className="size-4 sm:size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="truncate text-[15px] font-semibold tracking-tight sm:text-base">
                {clientDisplayName(client)}
              </p>
              <ClientTypeBadge type={client.client_type} short />
            </div>
            {subtitle ? (
              <p className="truncate text-[13px] text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            ) : null}
            {contact ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                {contact}
              </p>
            ) : null}
          </div>
          <ChevronRight className={mobileListCardChevronClassName} aria-hidden />
        </div>
      </article>
    </Link>
  );
}

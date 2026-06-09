import Link from "next/link";
import { Building2, ChevronRight, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ClientRow } from "@/lib/validations/client";
import {
  clientDisplayName,
  clientSubtitle,
} from "@/lib/validations/client";
import { surfaceCardInteractiveClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: ClientRow;
}

export function ClientCard({ client }: ClientCardProps) {
  const subtitle = clientSubtitle(client);
  const contact = [client.email, client.phone].filter(Boolean).join(" · ");

  return (
    <Link href={`/clients/${client.id}`} className="block group touch-manipulation">
      <article
        className={cn(
          surfaceCardInteractiveClassName,
          "flex items-center gap-3 p-3.5 transition-transform duration-150 active:scale-[0.99] sm:gap-4 sm:p-5",
        )}
      >
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
            <Badge
              variant="secondary"
              className="rounded-md border-0 bg-muted px-1.5 text-[9px] font-semibold uppercase tracking-wide sm:rounded-lg sm:px-2 sm:text-[10px]"
            >
              {client.client_type === "company" ? "Pro" : "Part."}
            </Badge>
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
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:size-5"
          aria-hidden
        />
      </article>
    </Link>
  );
}

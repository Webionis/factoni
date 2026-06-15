import Link from "next/link";
import { Mail, MapPin, Pencil, Phone } from "lucide-react";

import { ClientPortalAccessToggle } from "@/components/clients/client-portal-access-toggle";
import { ClientTypeBadge } from "@/components/clients/client-type-badge";
import { CopyClientPortalLinkButton } from "@/components/clients/copy-client-portal-link-button";
import { buttonVariants } from "@/components/ui/button";
import { surfaceCardClassName } from "@/lib/constants/ui";
import type { ClientRow } from "@/lib/validations/client";
import { formatClientAddress } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

interface ClientDetailSidebarProps {
  client: ClientRow;
  className?: string;
}

function ContactLine({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <p className="flex items-start gap-2 text-sm text-[#64748b] dark:text-[#94a3b8]">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="min-w-0 break-words">{value}</span>
    </p>
  );
}

export function ClientDetailSidebar({
  client,
  className,
}: ClientDetailSidebarProps) {
  const address = formatClientAddress(client);

  return (
    <aside className={cn("space-y-4 md:sticky md:top-24 md:self-start", className)}>
      <div className={cn(surfaceCardClassName, "space-y-4 p-5 sm:p-6")}>
        <ClientTypeBadge type={client.client_type} />

        <div className="space-y-2.5">
          <ContactLine icon={Mail} value={client.email} />
          <ContactLine icon={Phone} value={client.phone} />
          <ContactLine icon={MapPin} value={address} />
        </div>
      </div>

      <div className={cn(surfaceCardClassName, "space-y-4 p-5 sm:p-6")}>
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
            Espace client
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
            Partagez un lien unique pour que votre client retrouve ses devis,
            factures et reçus.
          </p>
        </div>
        <ClientPortalAccessToggle
          clientId={client.id}
          enabled={client.portal_access_enabled ?? true}
        />
        <CopyClientPortalLinkButton
          clientId={client.id}
          disabled={!client.portal_access_enabled}
        />
      </div>

      <div
        className={cn(
          surfaceCardClassName,
          "flex flex-col gap-2.5 p-4 sm:p-5",
          "[&_a]:w-full [&_button]:w-full [&_a]:justify-center [&_button]:justify-center",
        )}
      >
        <Link
          href={`/clients/${client.id}/edit`}
          className={cn(buttonVariants({ variant: "default" }), "h-11 gap-2")}
        >
          <Pencil className="size-4" aria-hidden />
          Modifier le client
        </Link>
      </div>
    </aside>
  );
}

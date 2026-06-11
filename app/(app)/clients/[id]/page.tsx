import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ClientLocationsSection } from "@/components/clients/client-locations-section";
import { ClientPortalAccessToggle } from "@/components/clients/client-portal-access-toggle";
import { CopyClientPortalLinkButton } from "@/components/clients/copy-client-portal-link-button";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getClientById } from "@/lib/data/clients";
import { listClientLocationsForClientPage } from "@/lib/data/client-locations";
import {
  clientDisplayName,
  clientSubtitle,
  formatClientAddress,
} from "@/lib/validations/client";
import { createPageMetadata, pageTitles } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const client = await getClientById(supabase, id);

  if (!client) {
    return createPageMetadata(pageTitles.clientDetail);
  }

  return createPageMetadata(clientDisplayName(client));
}

function DetailRow({
  icon: Icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  variant?: "default" | "address";
}) {
  if (!value) return null;

  if (variant === "address") {
    return (
      <div className="flex items-start gap-3">
        <Icon
          className="mt-1 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm leading-relaxed break-words text-foreground">
            {value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm break-words text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [client, locations] = await Promise.all([
    getClientById(supabase, id),
    listClientLocationsForClientPage(supabase, id, user.id),
  ]);

  if (!client || client.user_id !== user.id) {
    notFound();
  }

  const address = formatClientAddress(client);
  const subtitle = clientSubtitle(client);

  return (
    <div className="w-full space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux clients
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight break-words">
              {clientDisplayName(client)}
            </h1>
            <Badge variant="secondary">
              {client.client_type === "company" ? "Professionnel" : "Particulier"}
            </Badge>
          </div>
          {subtitle ? (
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={`/clients/${client.id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1")}
        >
          <Pencil className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Modifier</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Espace client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-5 pt-0">
          <p className="text-sm text-muted-foreground">
            Partagez un lien unique pour que votre client retrouve tous ses
            devis, factures et reçus.
          </p>
          <ClientPortalAccessToggle
            clientId={client.id}
            enabled={client.portal_access_enabled ?? true}
          />
          <CopyClientPortalLinkButton
            clientId={client.id}
            disabled={!client.portal_access_enabled}
          />
        </CardContent>
      </Card>

      <ClientLocationsSection clientId={client.id} initialLocations={locations} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-5 pt-0">
          <DetailRow icon={Mail} label="Email" value={client.email} />
          <DetailRow icon={Phone} label="Téléphone" value={client.phone} />
          <DetailRow
            icon={MapPin}
            label="Adresse"
            value={address}
            variant="address"
          />
        </CardContent>
      </Card>

      {client.client_type === "company" &&
      (client.siren || client.siret) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4" aria-hidden />
              Informations légales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {client.siren ? (
              <div>
                <p className="text-xs text-muted-foreground">SIREN</p>
                <p className="font-mono text-sm">{client.siren}</p>
              </div>
            ) : null}
            {client.siret ? (
              <div>
                <p className="text-xs text-muted-foreground">SIRET</p>
                <p className="font-mono text-sm">{client.siret}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {client.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes internes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      <DeleteClientDialog client={client} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ClientDetailSidebar } from "@/components/clients/client-detail-sidebar";
import { ClientLocationsSection } from "@/components/clients/client-locations-section";
import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const eyebrow =
    client.client_type === "company" ? "Client professionnel" : "Client particulier";

  return (
    <div className="min-w-0 space-y-6 md:space-y-8 overflow-x-hidden overscroll-x-none touch-pan-y">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux clients
      </Link>

      <PageHeader
        eyebrow={eyebrow}
        title={clientDisplayName(client)}
        description={subtitle ?? undefined}
        action={
          <Link
            href={`/clients/${client.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1",
            )}
          >
            <Pencil className="size-4" aria-hidden />
            Modifier
          </Link>
        }
      />

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <ClientLocationsSection clientId={client.id} initialLocations={locations} />

          <Card>
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
              <CardTitle className="text-base font-semibold tracking-tight">
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-6 pt-0 sm:px-6">
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
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                  <Building2 className="size-4" aria-hidden />
                  Informations légales
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 px-5 pb-6 pt-0 sm:grid-cols-2 sm:px-6">
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
              <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Notes internes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-6 pt-0 sm:px-6">
                <p className="text-sm leading-[1.7] whitespace-pre-wrap text-muted-foreground">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <div className="md:hidden">
            <ClientDetailSidebar client={client} />
          </div>

          <section
            className="flex flex-col gap-3 border-t border-border/50 pt-6 md:pt-7"
            aria-label="Suppression du client"
          >
            <DeleteClientDialog client={client} />
          </section>
        </div>

        <div className="hidden md:block">
          <ClientDetailSidebar client={client} />
        </div>
      </div>
    </div>
  );
}

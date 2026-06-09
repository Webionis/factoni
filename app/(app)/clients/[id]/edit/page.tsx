import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ClientForm } from "@/components/forms/client-form";
import { pageMetadata } from "@/lib/metadata";
import { getClientById } from "@/lib/data/clients";
import { clientRowToFormValues } from "@/lib/validations/client";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("clientEdit");

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const client = await getClientById(supabase, id);

  if (!client || client.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour au client
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le client</h1>
        <p className="mt-1 text-muted-foreground">{client.name}</p>
      </div>
      <ClientForm
        mode="edit"
        clientId={client.id}
        initialValues={clientRowToFormValues(client)}
      />
    </div>
  );
}

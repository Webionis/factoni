import { notFound, redirect } from "next/navigation";

import { ClientForm } from "@/components/forms/client-form";
import { AppPageShell } from "@/components/layout/app-page-shell";
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
    <AppPageShell
      backHref={`/clients/${client.id}`}
      backLabel="Retour au client"
      title="Modifier le client"
      description={client.name}
    >
      <ClientForm
        mode="edit"
        clientId={client.id}
        initialValues={clientRowToFormValues(client)}
      />
    </AppPageShell>
  );
}

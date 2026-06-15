import { redirect } from "next/navigation";

import { AppPageShell } from "@/components/layout/app-page-shell";
import { ClientForm } from "@/components/forms/client-form";
import { pageMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("clientNew");

export default async function NewClientPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppPageShell
      backHref="/clients"
      backLabel="Retour aux clients"
      title="Nouveau client"
      description="Les champs requis s'adaptent au type de client choisi."
    >
      <ClientForm mode="create" />
    </AppPageShell>
  );
}

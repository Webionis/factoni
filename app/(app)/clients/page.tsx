import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { ClientsList } from "@/components/clients/clients-list";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { listClientsForUser } from "@/lib/data/clients";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("clients");

/** Cache navigation client — affichage instantané entre sections. */
export const unstable_dynamicStaleTime = 300;

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const clients = await listClientsForUser(supabase, user.id);

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden overscroll-x-none touch-pan-y">
      <PageHeader
        title="Clients"
        description="Vos clients pour facturer plus vite."
        action={
          <Link
            href="/clients/new"
            className={cn(buttonVariants(), "h-11 gap-1.5")}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Nouveau client</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        }
      />
      <ClientsList clients={clients} />
    </div>
  );
}

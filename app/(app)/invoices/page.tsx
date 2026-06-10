import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { InvoicesList } from "@/components/invoices/invoices-list";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { assertInvoiceListIntegrity } from "@/lib/documents/list-integrity";
import { listInvoicesForUser } from "@/lib/data/invoices";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("invoices");

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const invoices = await listInvoicesForUser(supabase, user.id);

  if (process.env.NODE_ENV === "development") {
    assertInvoiceListIntegrity(invoices);
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Factures"
        description="Brouillons, envoyées et suivies en un coup d'œil."
        action={
          <Link
            href="/invoices/new"
            className={cn(buttonVariants(), "h-11 gap-1.5")}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Nouvelle facture</span>
            <span className="sm:hidden">Nouvelle</span>
          </Link>
        }
      />
      <InvoicesList invoices={invoices} />
    </div>
  );
}

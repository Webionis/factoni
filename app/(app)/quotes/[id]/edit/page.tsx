import { notFound, redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { getCompanyForUser } from "@/lib/auth/profile";
import { listCatalogItemsForUser } from "@/lib/data/catalog-items";
import { listClientsForUser } from "@/lib/data/clients";
import { getQuoteById } from "@/lib/data/quotes";
import { pageMetadata } from "@/lib/metadata";
import { invoiceToFormValues } from "@/lib/validations/invoice";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("quoteEdit");

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const quote = await getQuoteById(supabase, id);
  if (!quote || quote.user_id !== user.id) {
    notFound();
  }

  if (quote.status !== "draft") {
    redirect(`/quotes/${quote.id}`);
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const clients = await listClientsForUser(supabase, user.id);
  const catalogItems = await listCatalogItemsForUser(supabase, user.id);

  return (
    <AppPageShell
      backHref={`/quotes/${quote.id}`}
      backLabel="Retour au devis"
      title="Modifier le devis"
      description="Le numéro DV sera attribué à l'envoi."
    >
      <InvoiceForm
        mode="edit"
        documentType="quote"
        invoiceId={quote.id}
        initialValues={invoiceToFormValues(quote)}
        clients={clients}
        catalogItems={catalogItems}
        vatRegime={company.vat_regime}
      />
    </AppPageShell>
  );
}

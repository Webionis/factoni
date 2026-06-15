import { notFound, redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { pageMetadata } from "@/lib/metadata";
import { getCompanyForUser } from "@/lib/auth/profile";
import { listCatalogItemsForUser } from "@/lib/data/catalog-items";
import { listClientsForUser } from "@/lib/data/clients";
import { getInvoiceOnlyById } from "@/lib/data/invoices";
import { invoiceToFormValues } from "@/lib/validations/invoice";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("invoiceEdit");

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const invoice = await getInvoiceOnlyById(supabase, id);
  if (!invoice || invoice.user_id !== user.id) {
    notFound();
  }

  if (invoice.status !== "draft") {
    redirect(`/invoices/${invoice.id}`);
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const clients = await listClientsForUser(supabase, user.id);
  const catalogItems = await listCatalogItemsForUser(supabase, user.id);

  return (
    <AppPageShell
      backHref={`/invoices/${invoice.id}`}
      backLabel="Retour à la facture"
      title="Modifier le brouillon"
      description="Le numéro légal sera attribué à l'envoi."
    >
      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        initialValues={invoiceToFormValues(invoice)}
        clients={clients}
        catalogItems={catalogItems}
        vatRegime={company.vat_regime}
      />
    </AppPageShell>
  );
}

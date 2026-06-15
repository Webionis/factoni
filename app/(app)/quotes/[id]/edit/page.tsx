import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
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
    <div className="w-full space-y-6">
      <Link
        href={`/quotes/${quote.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour au devis
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le devis</h1>
        <p className="mt-1 text-muted-foreground">
          Le numéro DV sera attribué à l&apos;envoi.
        </p>
      </div>
      <InvoiceForm
        mode="edit"
        documentType="quote"
        invoiceId={quote.id}
        initialValues={invoiceToFormValues(quote)}
        clients={clients}
        catalogItems={catalogItems}
        vatRegime={company.vat_regime}
      />
    </div>
  );
}

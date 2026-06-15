import { UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { AppPageShell } from "@/components/layout/app-page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import { DEFAULT_INVOICE_LINE_ITEM_NATURE } from "@/lib/invoices/item-nature";
import { getCompanyForUser } from "@/lib/auth/profile";
import { listCatalogItemsForUser } from "@/lib/data/catalog-items";
import { listClientsForUser } from "@/lib/data/clients";
import { defaultQuoteValidityDate } from "@/lib/dates/quote-dates";
import { todayIsoDate } from "@/lib/dates/invoice-dates";
import { pageMetadata } from "@/lib/metadata";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("quoteNew");

export default async function NewQuotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const clients = await listClientsForUser(supabase, user.id);
  const catalogItems = await listCatalogItemsForUser(supabase, user.id);
  const today = todayIsoDate();

  if (clients.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau devis</h1>
          <p className="mt-1 text-muted-foreground">
            Ajoutez d&apos;abord un client.
          </p>
        </div>
        <EmptyState
          icon={UserPlus}
          title="Aucun client"
          description="Créez un client avant d'émettre votre premier devis."
          actionLabel="Nouveau client"
          actionHref="/clients/new"
        />
      </div>
    );
  }

  const initialValues: InvoiceFormValues = {
    client_id: clients[0]?.id ?? "",
    client_location_id: null,
    issue_date: today,
    due_date: defaultQuoteValidityDate(today),
    notes: "",
    payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
    lines: [
      {
        description: "",
        quantity: 1,
        unit_price_ht: 0,
        vat_rate: company.vat_regime === "franchise" ? 0 : 20,
        item_nature: DEFAULT_INVOICE_LINE_ITEM_NATURE,
      },
    ],
  };

  return (
    <AppPageShell
      backHref="/quotes"
      backLabel="Retour aux devis"
      title="Nouveau devis"
      description="Enregistré en brouillon — numéro DV-YYYY-NNNNNN à l'envoi."
    >
      <InvoiceForm
        mode="create"
        documentType="quote"
        initialValues={initialValues}
        clients={clients}
        catalogItems={catalogItems}
        vatRegime={company.vat_regime}
      />
    </AppPageShell>
  );
}

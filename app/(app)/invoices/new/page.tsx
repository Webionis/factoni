import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { pageMetadata } from "@/lib/metadata";
import { EmptyState } from "@/components/ui/empty-state";
import { getCompanyForUser } from "@/lib/auth/profile";
import { listClientsForUser } from "@/lib/data/clients";
import { getInvoiceById } from "@/lib/data/invoices";
import { DEFAULT_INVOICE_PAYMENT_TERM } from "@/lib/constants/payment-terms";
import { addOneMonthToIsoDate, todayIsoDate } from "@/lib/dates/invoice-dates";
import { invoiceToDuplicateFormValues } from "@/lib/invoices/duplicate";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("invoiceNew");

interface NewInvoicePageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function NewInvoicePage({
  searchParams,
}: NewInvoicePageProps) {
  const { from: sourceId } = await searchParams;
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
  const today = todayIsoDate();

  if (clients.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle facture</h1>
          <p className="mt-1 text-muted-foreground">
            Ajoutez d&apos;abord un client pour facturer.
          </p>
        </div>
        <EmptyState
          icon={UserPlus}
          title="Aucun client"
          description="Créez un client avant d'émettre votre première facture."
          actionLabel="Nouveau client"
          actionHref="/clients/new"
        />
      </div>
    );
  }

  let initialValues: InvoiceFormValues = {
    client_id: clients[0]?.id ?? "",
    client_location_id: null,
    issue_date: today,
    due_date: addOneMonthToIsoDate(today) ?? today,
    notes: "",
    payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
    lines: [
      {
        description: "",
        quantity: 1,
        unit_price_ht: 0,
        vat_rate: company.vat_regime === "franchise" ? 0 : 20,
      },
    ],
  };

  let subtitle =
    "Enregistrée en brouillon — numéro légal à l'envoi.";

  if (sourceId) {
    const source = await getInvoiceById(supabase, sourceId);
    if (source && source.user_id === user.id && source.invoice_lines.length > 0) {
      initialValues = {
        ...invoiceToDuplicateFormValues(source),
        payment_terms: DEFAULT_INVOICE_PAYMENT_TERM,
      };
      subtitle =
        "Pré-remplie à partir d'une facture existante — enregistrez pour créer un nouveau brouillon.";
    }
  }

  return (
    <div className="w-full space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour aux factures
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouvelle facture</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      <InvoiceForm
        mode="create"
        initialValues={initialValues}
        clients={clients}
        vatRegime={company.vat_regime}
      />
    </div>
  );
}

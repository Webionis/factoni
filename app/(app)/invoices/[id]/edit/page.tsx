import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { pageMetadata } from "@/lib/metadata";
import { getCompanyForUser } from "@/lib/auth/profile";
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

  return (
    <div className="w-full space-y-6">
      <Link
        href={`/invoices/${invoice.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour à la facture
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modifier le brouillon</h1>
        <p className="mt-1 text-muted-foreground">
          Le numéro légal sera attribué à l&apos;envoi.
        </p>
      </div>
      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        initialValues={invoiceToFormValues(invoice)}
        clients={clients}
        vatRegime={company.vat_regime}
      />
    </div>
  );
}

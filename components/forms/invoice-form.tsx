"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { InterventionLocationSelect } from "@/components/forms/intervention-location-select";
import { InvoiceLinesEditor } from "@/components/invoices/invoice-lines-editor";
import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/lib/actions/invoices";
import {
  createQuoteAction,
  updateQuoteAction,
} from "@/lib/actions/quotes";
import type { DocumentType } from "@/lib/documents/types";
import {
  PaymentTermsField,
  resolveInitialPaymentTerms,
} from "@/components/forms/payment-terms-field";
import { defaultQuoteValidityDate } from "@/lib/dates/quote-dates";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { addOneMonthToIsoDate } from "@/lib/dates/invoice-dates";
import type { VatRegime } from "@/lib/constants/vat";
import type { CatalogItemRow } from "@/lib/data/catalog-items";
import type { ClientRow } from "@/lib/validations/client";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NumericFormInput } from "@/components/ui/numeric-form-input";
import { mobileStickyFooterClassName } from "@/lib/constants/mobile";
import { inputClassName, selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

function clientOptionLabel(client: ClientRow): string {
  if (client.client_type === "company" && client.company_name) {
    return `${client.company_name} (${client.name})`;
  }
  return client.name;
}

interface InvoiceFormProps {
  mode: "create" | "edit";
  documentType?: DocumentType;
  invoiceId?: string;
  initialValues: InvoiceFormValues;
  clients: ClientRow[];
  catalogItems: CatalogItemRow[];
  vatRegime: VatRegime;
  defaultPaymentTerms?: string | null;
}

export function InvoiceForm({
  mode,
  documentType = "invoice",
  invoiceId,
  initialValues,
  clients,
  catalogItems,
  vatRegime,
}: InvoiceFormProps) {
  const isQuote = documentType === "quote";
  const basePath = isQuote ? "/quotes" : "/invoices";
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialPaymentTerms = resolveInitialPaymentTerms(
    mode,
    initialValues.payment_terms,
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      ...initialValues,
      payment_terms: initialPaymentTerms,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const hasManualDueDateEdit = useRef(false);
  const issueDate = useWatch({ control, name: "issue_date" });

  useEffect(() => {
    if (mode !== "create" || hasManualDueDateEdit.current) return;
    if (!issueDate) return;
    const nextDue = isQuote
      ? defaultQuoteValidityDate(issueDate)
      : addOneMonthToIsoDate(issueDate);
    if (!nextDue) return;
    setValue("due_date", nextDue, { shouldValidate: true });
  }, [issueDate, isQuote, mode, setValue]);

  const dueDateField = register("due_date");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  async function onSubmit(values: InvoiceFormValues) {
    if (isSubmitting) return;
    setServerError(null);

    if (mode === "create") {
      const result = await runServerAction(() =>
        isQuote ? createQuoteAction(values) : createInvoiceAction(values),
      );
      applyActionResult(result, router, {
        successMessage: isQuote ? "Devis créé" : "Facture créée",
        setServerError,
      });
      return;
    }

    if (!invoiceId) {
      setServerError(isQuote ? "Devis introuvable." : "Facture introuvable.");
      return;
    }

    const result = await runServerAction(() =>
      isQuote
        ? updateQuoteAction(invoiceId, values)
        : updateInvoiceAction(invoiceId, values),
    );
    if (
      applyActionResult(result, router, {
        successMessage: isQuote ? "Devis enregistré" : "Facture enregistrée",
        setServerError,
      })
    ) {
      router.refresh();
      router.push(`${basePath}/${invoiceId}`);
    }
  }

  return (
    <FormProvider {...form}>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {serverError ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      {clients.length === 0 ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <Link href="/clients/new" className="font-medium underline">
            Ajoutez un client
          </Link>{" "}
          avant de créer {isQuote ? "un devis" : "une facture"}.
        </p>
      ) : null}

      <section className="space-y-5">
        <FormField
          label="Client"
          htmlFor="client_id"
          error={errors.client_id?.message}
        >
          <select
            id="client_id"
            className={selectClassName}
            disabled={clients.length === 0}
            {...register("client_id")}
          >
            <option value="">Sélectionner…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {clientOptionLabel(c)}
              </option>
            ))}
          </select>
        </FormField>

        <InterventionLocationSelect disabled={clients.length === 0} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Date d'émission"
            htmlFor="issue_date"
            error={errors.issue_date?.message}
          >
            <Input
              id="issue_date"
              type="date"
              className={inputClassName}
              {...register("issue_date")}
            />
          </FormField>
          <FormField
            label={isQuote ? "Date de validité" : "Date d'échéance"}
            htmlFor="due_date"
            error={errors.due_date?.message}
          >
            <Input
              id="due_date"
              type="date"
              className={inputClassName}
              name={dueDateField.name}
              ref={dueDateField.ref}
              onBlur={dueDateField.onBlur}
              onChange={(e) => {
                if (mode === "create") {
                  hasManualDueDateEdit.current = true;
                }
                dueDateField.onChange(e);
              }}
            />
          </FormField>
        </div>

        <PaymentTermsField
          initialPaymentTerms={initialPaymentTerms}
          setValue={setValue}
        />
        <input type="hidden" {...register("payment_terms")} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Remise globale</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Remise (%)"
            htmlFor="discount_percent"
            error={errors.discount_percent?.message}
          >
            <NumericFormInput
              control={control}
              name="discount_percent"
              id="discount_percent"
              className={inputClassName}
              placeholder="0"
            />
          </FormField>
          <FormField
            label="Remise (€ HT)"
            htmlFor="discount_amount"
            error={errors.discount_amount?.message}
          >
            <NumericFormInput
              control={control}
              name="discount_amount"
              id="discount_amount"
              className={inputClassName}
              placeholder="0"
            />
          </FormField>
        </div>
        <p className="text-xs text-muted-foreground">
          Utilisez soit un pourcentage, soit un montant — pas les deux.
        </p>
      </section>

      <InvoiceLinesEditor
        control={control}
        fields={fields}
        append={append}
        remove={remove}
        register={register}
        errors={errors}
        vatRegime={vatRegime}
        catalogItems={catalogItems}
      />

      <section>
        <FormField
          label={
            <>
              Notes{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optionnel)
              </span>
            </>
          }
          htmlFor="notes"
        >
          <textarea
            id="notes"
            rows={2}
            className={cn(
              selectClassName,
              "block h-auto min-h-[72px] resize-y py-3 leading-normal",
            )}
            {...register("notes")}
          />
        </FormField>
      </section>

      <div className={mobileStickyFooterClassName}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="h-12 flex-1 text-base"
            disabled={isSubmitting || clients.length === 0}
          >
            {isSubmitting
              ? "Enregistrement…"
              : mode === "create"
                ? isQuote
                  ? "Enregistrer le devis"
                  : "Enregistrer la facture"
                : isQuote
                  ? "Mettre à jour le devis"
                  : "Mettre à jour le brouillon"}
          </Button>
          <Link
            href={
              mode === "edit" && invoiceId
                ? `${basePath}/${invoiceId}`
                : basePath
            }
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex h-12 items-center justify-center px-6",
            )}
          >
            Annuler
          </Link>
        </div>
      </div>
    </form>
    </FormProvider>
  );
}

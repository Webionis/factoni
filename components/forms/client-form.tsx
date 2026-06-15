"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  createClientAction,
  updateClientAction,
} from "@/lib/actions/clients";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validations/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { mobileStickyFooterClassName } from "@/lib/constants/mobile";
import {
  formSectionClassName,
  formSectionDescriptionClassName,
  formSectionTitleClassName,
  inputClassName,
  selectClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const defaultClientFormValues: ClientFormValues = {
  client_type: "individual",
  name: "",
  company_name: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  postal_code: "",
  city: "",
  country: "FR",
  siren: "",
  siret: "",
  notes: "",
};

interface ClientFormProps {
  mode: "create" | "edit";
  clientId?: string;
  initialValues?: ClientFormValues;
}

export function ClientForm({ mode, clientId, initialValues }: ClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialValues ?? defaultClientFormValues,
  });

  const clientType = watch("client_type");

  async function onSubmit(values: ClientFormValues) {
    if (isSubmitting) return;
    setServerError(null);
    setSuccessMessage(null);

    if (mode === "create") {
      const result = await runServerAction(() => createClientAction(values));
      applyActionResult(result, router, { setServerError });
      return;
    }

    if (!clientId) {
      setServerError("Identifiant client manquant.");
      return;
    }

    const result = await runServerAction(() =>
      updateClientAction(clientId, values),
    );
    if (
      applyActionResult(result, router, {
        successMessage: "Client ajouté",
        setServerError,
      })
    ) {
      router.refresh();
      router.push(`/clients/${clientId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}
      {successMessage ? (
        <p
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}

      <section className={formSectionClassName}>
        <div>
          <h2 className={formSectionTitleClassName}>Type de client</h2>
          <p className={cn("mt-1", formSectionDescriptionClassName)}>
            Particulier ou professionnel — les champs requis s&apos;adaptent au type choisi.
          </p>
        </div>
        <FormField
          label="Type"
          htmlFor="client_type"
          error={errors.client_type?.message}
        >
          <select
            id="client_type"
            className={selectClassName}
            {...register("client_type")}
          >
            <option value="individual">Particulier</option>
            <option value="company">Entreprise / professionnel</option>
          </select>
        </FormField>
      </section>

      <section className={formSectionClassName}>
        <div>
          <h2 className={formSectionTitleClassName}>Identité</h2>
          <p className={cn("mt-1", formSectionDescriptionClassName)}>
            Nom affiché sur vos devis et factures.
          </p>
        </div>
        <FormField
          label={
            clientType === "company"
              ? "Nom du contact"
              : "Nom complet"
          }
          htmlFor="name"
          error={errors.name?.message}
        >
          <Input
            id="name"
            className={inputClassName}
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>
        {clientType === "company" ? (
          <FormField
            label="Raison sociale / entreprise"
            htmlFor="company_name"
            error={errors.company_name?.message}
          >
            <Input
              id="company_name"
              className={inputClassName}
              aria-invalid={!!errors.company_name}
              {...register("company_name")}
            />
          </FormField>
        ) : null}
      </section>

      <section className={formSectionClassName}>
        <div>
          <h2 className={formSectionTitleClassName}>Contact</h2>
          <p className={cn("mt-1", formSectionDescriptionClassName)}>
            Email et téléphone pour l&apos;envoi des documents et des relances.
          </p>
        </div>
        <FormField
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            className={inputClassName}
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField label="Téléphone" htmlFor="phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            className={inputClassName}
            autoComplete="tel"
            {...register("phone")}
          />
        </FormField>
      </section>

      <section className={formSectionClassName}>
        <div>
          <h2 className={formSectionTitleClassName}>Adresse</h2>
          <p className={cn("mt-1", formSectionDescriptionClassName)}>
            Adresse de facturation ou du siège (optionnel).
          </p>
        </div>
        <FormField label="Adresse" htmlFor="address_line1">
          <Input id="address_line1" className={inputClassName} {...register("address_line1")} />
        </FormField>
        <FormField label="Complément" htmlFor="address_line2">
          <Input id="address_line2" className={inputClassName} {...register("address_line2")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Code postal" htmlFor="postal_code">
            <Input id="postal_code" className={inputClassName} {...register("postal_code")} />
          </FormField>
          <FormField label="Ville" htmlFor="city">
            <Input id="city" className={inputClassName} {...register("city")} />
          </FormField>
        </div>
        <FormField label="Pays" htmlFor="country">
          <Input id="country" className={inputClassName} {...register("country")} />
        </FormField>
      </section>

      {clientType === "company" ? (
        <section className={formSectionClassName}>
          <div>
            <h2 className={formSectionTitleClassName}>Informations légales</h2>
            <p className={cn("mt-1", formSectionDescriptionClassName)}>
              SIREN et SIRET pour les clients professionnels.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="SIREN"
              htmlFor="siren"
              error={errors.siren?.message}
              hint="9 chiffres"
            >
              <Input
                id="siren"
                inputMode="numeric"
                className={inputClassName}
                aria-invalid={!!errors.siren}
                {...register("siren")}
              />
            </FormField>
            <FormField
              label="SIRET"
              htmlFor="siret"
              error={errors.siret?.message}
              hint="14 chiffres"
            >
              <Input
                id="siret"
                inputMode="numeric"
                className={inputClassName}
                aria-invalid={!!errors.siret}
                {...register("siret")}
              />
            </FormField>
          </div>
        </section>
      ) : null}

      <section className={formSectionClassName}>
        <div>
          <h2 className={formSectionTitleClassName}>Notes internes</h2>
          <p className={cn("mt-1", formSectionDescriptionClassName)}>
            Rappels pour vous uniquement — non visibles sur les documents.
          </p>
        </div>
        <FormField label="Notes" htmlFor="notes">
          <textarea
            id="notes"
            rows={3}
            className={cn(selectClassName, "min-h-[88px] resize-y py-2")}
            {...register("notes")}
          />
        </FormField>
      </section>

      <div className={mobileStickyFooterClassName}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="h-12 flex-1 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Enregistrement…"
              : mode === "create"
                ? "Créer le client"
                : "Enregistrer"}
          </Button>
          <Link
            href={
              mode === "edit" && clientId ? `/clients/${clientId}` : "/clients"
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
  );
}

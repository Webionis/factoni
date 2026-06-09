"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { completeOnboarding, updateCompany } from "@/lib/actions/company";
import { applyActionResult, runServerAction } from "@/lib/client/action-feedback";
import { useRouter } from "next/navigation";
import { FRENCH_VAT_RATES, FRANCHISE_MENTION } from "@/lib/constants/vat";
import {
  companyFormSchema,
  type CompanyFormValues,
} from "@/lib/validations/company";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  formSectionClassName,
  formSectionTitleClassName,
  inputClassName,
  selectClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

export const defaultCompanyFormValues: CompanyFormValues = {
  trade_name: "",
  legal_name: "",
  address_line1: "",
  address_line2: "",
  postal_code: "",
  city: "",
  country: "FR",
  email: "",
  phone: "",
  siren: "",
  siret: "",
  vat_number: "",
  vat_regime: "standard",
  default_vat_rate: 20,
  payment_terms: "Paiement à 30 jours",
  legal_mentions: "",
};

interface CompanyFormProps {
  mode: "onboarding" | "settings";
  initialValues?: CompanyFormValues;
}

export function CompanyForm({ mode, initialValues }: CompanyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: initialValues ?? defaultCompanyFormValues,
  });

  const vatRegime = watch("vat_regime");

  useEffect(() => {
    if (vatRegime === "franchise") {
      setValue("default_vat_rate", 0);
      setValue("legal_mentions", FRANCHISE_MENTION);
    }
  }, [vatRegime, setValue]);

  async function onSubmit(values: CompanyFormValues) {
    if (isSubmitting) return;
    setServerError(null);
    setSuccessMessage(null);

    if (mode === "onboarding") {
      const result = await runServerAction(() => completeOnboarding(values));
      applyActionResult(result, router, { setServerError });
      return;
    }

    const result = await runServerAction(() => updateCompany(values));
    if (
      applyActionResult(result, router, {
        successMessage: "Entreprise mise à jour",
        setServerError,
      })
    ) {
      setSuccessMessage("Entreprise mise à jour.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
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
        <h2 className={formSectionTitleClassName}>Identité</h2>
        <FormField
          label="Nom commercial / enseigne"
          htmlFor="trade_name"
          error={errors.trade_name?.message}
        >
          <Input
            id="trade_name"
            className={inputClassName}
            aria-invalid={!!errors.trade_name}
            {...register("trade_name")}
          />
        </FormField>
        <FormField
          label="Raison sociale / nom légal"
          htmlFor="legal_name"
          error={errors.legal_name?.message}
        >
          <Input
            id="legal_name"
            className={inputClassName}
            aria-invalid={!!errors.legal_name}
            {...register("legal_name")}
          />
        </FormField>
      </section>

      <section className={formSectionClassName}>
        <h2 className={formSectionTitleClassName}>Adresse</h2>
        <FormField
          label="Adresse"
          htmlFor="address_line1"
          error={errors.address_line1?.message}
        >
          <Input
            id="address_line1"
            className={inputClassName}
            aria-invalid={!!errors.address_line1}
            {...register("address_line1")}
          />
        </FormField>
        <FormField label="Complément" htmlFor="address_line2">
          <Input id="address_line2" className={inputClassName} {...register("address_line2")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Code postal"
            htmlFor="postal_code"
            error={errors.postal_code?.message}
          >
            <Input
              id="postal_code"
              className={inputClassName}
              aria-invalid={!!errors.postal_code}
              {...register("postal_code")}
            />
          </FormField>
          <FormField
            label="Ville"
            htmlFor="city"
            error={errors.city?.message}
          >
            <Input
              id="city"
              className={inputClassName}
              aria-invalid={!!errors.city}
              {...register("city")}
            />
          </FormField>
        </div>
        <FormField label="Pays" htmlFor="country" error={errors.country?.message}>
          <Input id="country" className={inputClassName} {...register("country")} />
        </FormField>
      </section>

      <section className={formSectionClassName}>
        <h2 className={formSectionTitleClassName}>Contact</h2>
        <FormField
          label="Email professionnel"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            className={inputClassName}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField label="Téléphone" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            className={inputClassName}
            {...register("phone")}
          />
        </FormField>
      </section>

      <section className={formSectionClassName}>
        <h2 className={formSectionTitleClassName}>Informations légales</h2>
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
        <FormField
          label="Régime TVA"
          htmlFor="vat_regime"
          error={errors.vat_regime?.message}
        >
          <select
            id="vat_regime"
            className={cn(selectClassName, "aria-invalid:border-destructive")}
            aria-invalid={!!errors.vat_regime}
            {...register("vat_regime")}
          >
            <option value="standard">Assujetti TVA (taux normal)</option>
            <option value="franchise">Franchise en base de TVA</option>
          </select>
        </FormField>
        <FormField
          label="Taux TVA par défaut"
          htmlFor="default_vat_rate"
          error={errors.default_vat_rate?.message}
        >
          <select
            id="default_vat_rate"
            className={selectClassName}
            disabled={vatRegime === "franchise"}
            {...register("default_vat_rate", {
              setValueAs: (v) => (v === "" ? 0 : Number(v)),
            })}
          >
            {FRENCH_VAT_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate} %
              </option>
            ))}
          </select>
        </FormField>
        {vatRegime === "standard" ? (
          <FormField
            label="N° TVA intracommunautaire"
            htmlFor="vat_number"
            error={errors.vat_number?.message}
            hint="Optionnel si non assujetti"
          >
            <Input
              id="vat_number"
              placeholder="FR12345678901"
              className={inputClassName}
              aria-invalid={!!errors.vat_number}
              {...register("vat_number")}
            />
          </FormField>
        ) : null}
        <FormField
          label="Mentions légales (factures)"
          htmlFor="legal_mentions"
          error={errors.legal_mentions?.message}
        >
          <textarea
            id="legal_mentions"
            rows={3}
            className={cn(
              selectClassName,
              "block h-auto min-h-[88px] resize-y py-3 leading-normal",
            )}
            {...register("legal_mentions")}
          />
        </FormField>
        <FormField label="Conditions de paiement" htmlFor="payment_terms">
          <Input
            id="payment_terms"
            className={inputClassName}
            {...register("payment_terms")}
          />
        </FormField>
      </section>

      <Button
        type="submit"
        className="h-12 w-full text-base sm:w-auto sm:min-w-[200px]"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Enregistrement…"
          : mode === "onboarding"
            ? "Terminer et accéder au tableau de bord"
            : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}

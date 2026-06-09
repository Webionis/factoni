"use client";

import { useEffect, useMemo, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_INVOICE_PAYMENT_TERM,
  mergePaymentTermsForSubmit,
  PAYMENT_TERMS_OTHER_LABEL,
  PAYMENT_TERMS_OTHER_VALUE,
  PAYMENT_TERMS_PRESETS,
  splitPaymentTermsForForm,
} from "@/lib/constants/payment-terms";
import { inputClassName, selectClassName } from "@/lib/constants/ui";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { cn } from "@/lib/utils";

interface PaymentTermsFieldProps {
  initialPaymentTerms: string;
  setValue: UseFormSetValue<InvoiceFormValues>;
}

export function PaymentTermsField({
  initialPaymentTerms,
  setValue,
}: PaymentTermsFieldProps) {
  const split = useMemo(
    () => splitPaymentTermsForForm(initialPaymentTerms),
    [initialPaymentTerms],
  );
  const [preset, setPreset] = useState(split.preset);
  const [customOther, setCustomOther] = useState(split.customOther);

  useEffect(() => {
    const next = splitPaymentTermsForForm(initialPaymentTerms);
    setPreset(next.preset);
    setCustomOther(next.customOther);
  }, [initialPaymentTerms]);

  useEffect(() => {
    setValue(
      "payment_terms",
      mergePaymentTermsForSubmit(preset, customOther),
      { shouldValidate: true },
    );
  }, [preset, customOther, setValue]);

  return (
    <FormField label="Conditions de paiement" htmlFor="payment_terms">
      <select
        id="payment_terms"
        className={selectClassName}
        value={preset}
        onChange={(e) => setPreset(e.target.value)}
      >
        {PAYMENT_TERMS_PRESETS.map((term) => (
          <option key={term} value={term}>
            {term}
          </option>
        ))}
        <option value={PAYMENT_TERMS_OTHER_VALUE}>
          {PAYMENT_TERMS_OTHER_LABEL}
        </option>
      </select>
      {preset === PAYMENT_TERMS_OTHER_VALUE ? (
        <Input
          className={cn(inputClassName, "mt-2")}
          value={customOther}
          onChange={(e) => setCustomOther(e.target.value)}
          placeholder="Précisez les conditions…"
          aria-label="Autres conditions de paiement"
        />
      ) : null}
    </FormField>
  );
}

export function resolveInitialPaymentTerms(
  mode: "create" | "edit",
  stored: string | null | undefined,
): string {
  const trimmed = stored?.trim();
  if (trimmed) return trimmed;
  return DEFAULT_INVOICE_PAYMENT_TERM;
}

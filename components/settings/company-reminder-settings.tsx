"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { mobileStickyFooterClassName } from "@/lib/constants/mobile";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateCompanyReminderSettingsAction,
  type CompanyReminderSettingsValues,
} from "@/lib/actions/company-reminder-settings";
import {
  formPanelClassName,
  formPanelFooterClassName,
  formPanelSectionClassName,
  formPanelSectionTitleClassName,
  inputClassName,
  surfaceInsetClassName,
} from "@/lib/constants/ui";
import {
  DEFAULT_REMINDER_EMAIL_MESSAGE,
  DEFAULT_REMINDER_EMAIL_SUBJECT,
} from "@/lib/invoices/reminder-template-vars";
import { cn } from "@/lib/utils";

interface CompanyReminderSettingsProps {
  initialValues: CompanyReminderSettingsValues;
}

export function CompanyReminderSettings({
  initialValues,
}: CompanyReminderSettingsProps) {
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof CompanyReminderSettingsValues>(
    key: K,
    value: CompanyReminderSettingsValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateCompanyReminderSettingsAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Paramètres de relance enregistrés");
    });
  }

  return (
    <section className={formPanelClassName} aria-labelledby="reminders-heading">
      <div className={formPanelSectionClassName}>
        <div>
          <h2
            id="reminders-heading"
            className="text-[15px] font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]"
          >
            Relances automatiques
          </h2>
          <p className="mt-1 text-sm text-[#64748b] dark:text-[#94a3b8]">
            Rappels envoyés après l&apos;échéance des factures impayées.
          </p>
        </div>

        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm",
            values.auto_reminders_enabled
              ? "border-[rgba(37,99,235,0.16)] bg-[rgba(37,99,235,0.05)]"
              : "border-[rgba(15,23,42,0.06)] bg-[#fafbfc]/80 dark:border-[rgba(148,163,184,0.1)] dark:bg-[rgba(15,23,42,0.35)]",
          )}
        >
          <input
            type="checkbox"
            className="size-4 rounded border-border"
            checked={values.auto_reminders_enabled}
            onChange={(e) =>
              updateField("auto_reminders_enabled", e.target.checked)
            }
          />
          <span className="font-medium">Activer les relances automatiques</span>
        </label>

        <div>
          <p className={formPanelSectionTitleClassName}>Échéances</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["auto_reminder_day_3", "J+3"],
                ["auto_reminder_day_7", "J+7"],
                ["auto_reminder_day_14", "J+14 (finale)"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  values[key] && values.auto_reminders_enabled
                    ? "border-[rgba(37,99,235,0.14)] bg-[rgba(37,99,235,0.04)]"
                    : "border-[rgba(15,23,42,0.06)] dark:border-[rgba(148,163,184,0.1)]",
                  !values.auto_reminders_enabled && "opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border"
                  checked={values[key]}
                  disabled={!values.auto_reminders_enabled}
                  onChange={(e) => updateField(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={formPanelSectionClassName}>
        <p className={formPanelSectionTitleClassName}>Contenu de l&apos;email</p>
        <div className="space-y-4">
          <FormField
            label="Objet"
            htmlFor="reminder-subject"
            hint="{{client_name}}, {{invoice_number}}, {{amount}}, {{due_date}}, {{invoice_link}}"
          >
            <Input
              id="reminder-subject"
              className={inputClassName}
              value={values.reminder_email_subject ?? ""}
              placeholder={DEFAULT_REMINDER_EMAIL_SUBJECT}
              maxLength={200}
              onChange={(e) =>
                updateField("reminder_email_subject", e.target.value)
              }
            />
          </FormField>

          <FormField
            label="Message"
            htmlFor="reminder-message"
            hint="{{company_name}} et variables ci-dessus"
          >
            <Textarea
              id="reminder-message"
              value={values.reminder_email_message ?? ""}
              placeholder={DEFAULT_REMINDER_EMAIL_MESSAGE}
              maxLength={8000}
              className={cn(
                inputClassName,
                "min-h-[120px] resize-y py-3 leading-relaxed",
              )}
              onChange={(e) =>
                updateField("reminder_email_message", e.target.value)
              }
            />
          </FormField>

          <p
            className={cn(
              "text-xs leading-relaxed",
              surfaceInsetClassName,
              "px-3 py-2.5",
            )}
          >
            Les relances ne partent que pour les factures envoyées, non payées et
            non archivées.
          </p>
        </div>
      </div>

      <div className={cn(formPanelFooterClassName, "hidden md:flex")}>
        <Button
          type="button"
          className="h-11 w-full text-base sm:w-auto sm:min-w-[220px]"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les relances"}
        </Button>
      </div>

      <div className={cn(mobileStickyFooterClassName, "md:hidden")}>
        <Button
          type="button"
          className="h-11 w-full text-base"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les relances"}
        </Button>
      </div>
    </section>
  );
}

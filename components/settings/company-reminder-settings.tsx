"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateCompanyReminderSettingsAction,
  type CompanyReminderSettingsValues,
} from "@/lib/actions/company-reminder-settings";
import {
  DEFAULT_REMINDER_EMAIL_MESSAGE,
  DEFAULT_REMINDER_EMAIL_SUBJECT,
} from "@/lib/invoices/reminder-template-vars";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Relances automatiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-border"
            checked={values.auto_reminders_enabled}
            onChange={(e) =>
              updateField("auto_reminders_enabled", e.target.checked)
            }
          />
          Activer les relances automatiques
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={values.auto_reminder_day_3}
              disabled={!values.auto_reminders_enabled}
              onChange={(e) =>
                updateField("auto_reminder_day_3", e.target.checked)
              }
            />
            J+3 après échéance
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={values.auto_reminder_day_7}
              disabled={!values.auto_reminders_enabled}
              onChange={(e) =>
                updateField("auto_reminder_day_7", e.target.checked)
              }
            />
            J+7
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={values.auto_reminder_day_14}
              disabled={!values.auto_reminders_enabled}
              onChange={(e) =>
                updateField("auto_reminder_day_14", e.target.checked)
              }
            />
            J+14 (relance finale)
          </label>
        </div>

        <FormField
          label="Objet de l'email"
          htmlFor="reminder-subject"
          hint="Variables : {{client_name}}, {{invoice_number}}, {{amount}}, {{due_date}}, {{invoice_link}}"
        >
          <Input
            id="reminder-subject"
            value={values.reminder_email_subject ?? ""}
            placeholder={DEFAULT_REMINDER_EMAIL_SUBJECT}
            maxLength={200}
            onChange={(e) =>
              updateField("reminder_email_subject", e.target.value)
            }
          />
        </FormField>

        <FormField
          label="Message de l'email"
          htmlFor="reminder-message"
          hint="Variables : {{client_name}}, {{invoice_number}}, {{amount}}, {{due_date}}, {{invoice_link}}, {{company_name}}"
        >
          <Textarea
            id="reminder-message"
            value={values.reminder_email_message ?? ""}
            placeholder={DEFAULT_REMINDER_EMAIL_MESSAGE}
            maxLength={8000}
            className="min-h-[160px] resize-y font-[inherit] leading-relaxed"
            onChange={(e) =>
              updateField("reminder_email_message", e.target.value)
            }
          />
        </FormField>

        <Button type="button" disabled={isPending} onClick={handleSubmit}>
          {isPending ? "Enregistrement…" : "Enregistrer les relances"}
        </Button>
      </CardContent>
    </Card>
  );
}

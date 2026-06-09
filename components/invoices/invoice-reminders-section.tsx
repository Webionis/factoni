"use client";

import { Bell, BellOff, Clock, History } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toggleInvoiceAutoRemindersAction } from "@/lib/actions/invoice-reminder";
import type { InvoiceReminderRow } from "@/lib/data/invoice-reminders";
import {
  reminderTypeLabel,
  type AutoInvoiceReminderType,
} from "@/lib/invoices/reminder-types";
import { cn } from "@/lib/utils";

interface InvoiceRemindersSectionProps {
  invoiceId: string;
  reminders: InvoiceReminderRow[];
  autoRemindersDisabled: boolean;
  autoRemindersEnabled: boolean;
  nextAutoReminder: {
    type: AutoInvoiceReminderType;
    date: string;
  } | null;
  sentByName?: string | null;
}

function formatReminderDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateStr}T12:00:00`));
}

function historyLine(reminder: InvoiceReminderRow): string {
  const dateLabel = formatReminderDate(reminder.sent_at);
  if (reminder.reminder_type === "manual") {
    const sender = reminder.sent_by_name?.trim();
    return sender
      ? `Relance manuelle envoyée par ${sender} le ${dateLabel}`
      : `Relance manuelle envoyée le ${dateLabel}`;
  }
  return `${reminderTypeLabel(reminder.reminder_type as "auto_3")} envoyée le ${dateLabel}`;
}

export function InvoiceRemindersSection({
  invoiceId,
  reminders,
  autoRemindersDisabled,
  autoRemindersEnabled,
  nextAutoReminder,
}: InvoiceRemindersSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const sentReminders = reminders.filter((r) => r.status === "sent");
  const lastReminder = sentReminders[0] ?? null;

  function handleToggleAutoReminders() {
    startTransition(async () => {
      const result = await toggleInvoiceAutoRemindersAction(
        invoiceId,
        !autoRemindersDisabled,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        autoRemindersDisabled
          ? "Relances automatiques réactivées"
          : "Relances automatiques désactivées pour cette facture",
      );
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Bell className="size-4 text-muted-foreground" aria-hidden />
          Relances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-6 pt-0 sm:px-6">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Relances envoyées</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">
              {sentReminders.length}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Dernière relance</dt>
            <dd className="mt-0.5 font-medium">
              {lastReminder
                ? formatReminderDate(lastReminder.sent_at)
                : "Aucune"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              Prochaine relance auto
            </dt>
            <dd className="mt-0.5 font-medium">
              {!autoRemindersEnabled || autoRemindersDisabled
                ? "Désactivées"
                : nextAutoReminder
                  ? `${reminderTypeLabel(nextAutoReminder.type).replace("Relance automatique ", "")} — ${formatShortDate(nextAutoReminder.date)}`
                  : "Aucune prévue"}
            </dd>
          </div>
        </dl>

        {sentReminders.length > 0 ? (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <History className="size-3.5 text-muted-foreground" aria-hidden />
              Historique des relances
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {sentReminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className={cn(
                    "rounded-lg border border-border/50 bg-muted/20 px-3 py-2",
                    reminder.status === "failed" && "border-destructive/30",
                  )}
                >
                  {historyLine(reminder)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {autoRemindersEnabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isPending}
            onClick={handleToggleAutoReminders}
          >
            {autoRemindersDisabled ? (
              <>
                <Bell className="size-3.5" aria-hidden />
                Réactiver les relances automatiques
              </>
            ) : (
              <>
                <BellOff className="size-3.5" aria-hidden />
                Désactiver les relances automatiques
              </>
            )}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Les relances automatiques sont désactivées dans les paramètres de
            votre entreprise.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

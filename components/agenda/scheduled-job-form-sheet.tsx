"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  archiveScheduledJobAction,
  createScheduledJobAction,
  updateScheduledJobAction,
} from "@/lib/actions/scheduled-jobs";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";
import {
  SCHEDULED_JOB_STATUSES,
  type ScheduledJobFormValues,
  type ScheduledJobStatus,
} from "@/lib/validations/scheduled-job";
import { SCHEDULED_JOB_STATUS_LABELS } from "@/lib/scheduled-jobs/status";
import type { ClientRow } from "@/lib/validations/client";
import { agendaCopy } from "@/lib/agenda/copy";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { inputClassName, selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type LocationOption = {
  id: string;
  label: string;
  is_default: boolean;
};

function clientOptionLabel(client: ClientRow): string {
  if (client.client_type === "company" && client.company_name) {
    return `${client.company_name} (${client.name})`;
  }
  return client.name;
}

function jobToForm(job: ScheduledJobWithRelations): ScheduledJobFormValues {
  return {
    title: job.title,
    client_id: job.client_id ?? "",
    client_location_id: job.client_location_id ?? "",
    scheduled_date: job.scheduled_date,
    scheduled_time: job.scheduled_time?.slice(0, 5) ?? "",
    status: job.status,
    notes: job.notes ?? "",
  };
}

const emptyForm = (defaultDate: string): ScheduledJobFormValues => ({
  title: "",
  client_id: "",
  client_location_id: "",
  scheduled_date: defaultDate,
  scheduled_time: "",
  status: "planned",
  notes: "",
});

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

interface ScheduledJobFormFieldsProps {
  form: ScheduledJobFormValues;
  clients: ClientRow[];
  locations: LocationOption[];
  loadingLocations: boolean;
  error: string | null;
  updateField: <K extends keyof ScheduledJobFormValues>(
    key: K,
    value: ScheduledJobFormValues[K],
  ) => void;
}

function ScheduledJobFormFields({
  form,
  clients,
  locations,
  loadingLocations,
  error,
  updateField,
}: ScheduledJobFormFieldsProps) {
  return (
    <div className="min-w-0 space-y-4">
      <FormField label="Titre" htmlFor="job_title">
        <Input
          id="job_title"
          className={inputClassName}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder={agendaCopy.titlePlaceholder}
        />
      </FormField>

      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        <FormField label="Date" htmlFor="job_date" className="min-w-0">
          <Input
            id="job_date"
            type="date"
            className={cn(inputClassName, "min-w-0 max-w-full")}
            value={form.scheduled_date}
            onChange={(e) => updateField("scheduled_date", e.target.value)}
          />
        </FormField>
        <FormField label="Heure (optionnel)" htmlFor="job_time" className="min-w-0">
          <Input
            id="job_time"
            type="time"
            className={cn(inputClassName, "min-w-0 max-w-full")}
            value={form.scheduled_time ?? ""}
            onChange={(e) => updateField("scheduled_time", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Client (optionnel)" htmlFor="job_client">
        <select
          id="job_client"
          className={selectClassName}
          value={form.client_id ?? ""}
          onChange={(e) => updateField("client_id", e.target.value || "")}
        >
          <option value="">Aucun client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {clientOptionLabel(client)}
            </option>
          ))}
        </select>
      </FormField>

      {form.client_id ? (
        <FormField label="Lieu d'intervention" htmlFor="job_location">
          <select
            id="job_location"
            className={selectClassName}
            disabled={loadingLocations}
            value={form.client_location_id ?? ""}
            onChange={(e) =>
              updateField("client_location_id", e.target.value || "")
            }
          >
            <option value="">Aucun lieu spécifique</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label}
                {location.is_default ? " (par défaut)" : ""}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <FormField label="Statut" htmlFor="job_status">
        <select
          id="job_status"
          className={selectClassName}
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as ScheduledJobStatus)
          }
        >
          {SCHEDULED_JOB_STATUSES.map((status) => (
            <option key={status} value={status}>
              {SCHEDULED_JOB_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Notes (optionnel)" htmlFor="job_notes">
        <textarea
          id="job_notes"
          rows={2}
          className={cn(
            selectClassName,
            "block h-auto min-h-[72px] resize-y py-3 leading-normal",
          )}
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </FormField>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface ScheduledJobFormActionsProps {
  isPending: boolean;
  editingJob: ScheduledJobWithRelations | null;
  onArchived?: (jobId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onArchive: () => void;
}

function ScheduledJobFormActions({
  isPending,
  editingJob,
  onArchived,
  onClose,
  onSubmit,
  onArchive,
}: ScheduledJobFormActionsProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          disabled={isPending}
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          type="button"
          className="h-11 w-full"
          disabled={isPending}
          onClick={onSubmit}
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
      {editingJob && onArchived ? (
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={onArchive}
        >
          Supprimer
        </Button>
      ) : null}
    </div>
  );
}

interface ScheduledJobFormSheetProps {
  open: boolean;
  onClose: () => void;
  clients: ClientRow[];
  editingJob: ScheduledJobWithRelations | null;
  defaultDate: string;
  onSaved: (job: ScheduledJobWithRelations) => void;
  onArchived?: (jobId: string) => void;
}

export function ScheduledJobFormSheet({
  open,
  onClose,
  clients,
  editingJob,
  defaultDate,
  onSaved,
  onArchived,
}: ScheduledJobFormSheetProps) {
  const isDesktop = useIsDesktop();
  const [form, setForm] = useState<ScheduledJobFormValues>(
    emptyForm(defaultDate),
  );
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const prevClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(editingJob ? jobToForm(editingJob) : emptyForm(defaultDate));
    setError(null);
    prevClientIdRef.current = editingJob?.client_id ?? null;
  }, [open, editingJob, defaultDate]);

  useEffect(() => {
    const clientId = form.client_id;
    if (!clientId || clientId === "") {
      setLocations([]);
      return;
    }

    let cancelled = false;
    setLoadingLocations(true);

    fetch(`/api/clients/${clientId}/locations`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<{ locations: LocationOption[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const next = data.locations ?? [];
        setLocations(next);

        const clientChanged = prevClientIdRef.current !== clientId;
        prevClientIdRef.current = clientId;

        if (!clientChanged) return;

        const defaultLocation = next.find((l) => l.is_default);
        setForm((current) => ({
          ...current,
          client_location_id: defaultLocation?.id ?? "",
        }));
      })
      .catch(() => {
        if (!cancelled) setLocations([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLocations(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.client_id]);

  function updateField<K extends keyof ScheduledJobFormValues>(
    key: K,
    value: ScheduledJobFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = editingJob
        ? await updateScheduledJobAction(editingJob.id, form)
        : await createScheduledJobAction(form);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.job) {
        onSaved(result.job);
      }
      onClose();
    });
  }

  function handleArchive() {
    if (!editingJob || !onArchived) return;
    if (!confirm(agendaCopy.deleteConfirm)) return;

    startTransition(async () => {
      const result = await archiveScheduledJobAction(editingJob.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onArchived(editingJob.id);
      onClose();
    });
  }

  const title = editingJob ? agendaCopy.edit : agendaCopy.plan;

  const formBody = (
    <ScheduledJobFormFields
      form={form}
      clients={clients}
      locations={locations}
      loadingLocations={loadingLocations}
      error={error}
      updateField={updateField}
    />
  );

  const formActions = (
    <ScheduledJobFormActions
      isPending={isPending}
      editingJob={editingJob}
      onArchived={onArchived}
      onClose={onClose}
      onSubmit={handleSubmit}
      onArchive={handleArchive}
    />
  );

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
      >
        <DialogContent
          className={cn(
            "!flex max-h-[min(90dvh,40rem)] max-w-lg flex-col gap-0 overflow-hidden p-0",
          )}
        >
          <DialogHeader className="shrink-0 border-b border-border/50 px-5 py-4 sm:px-6">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {formBody}
          </div>
          <DialogFooter className="shrink-0 border-t border-border/50 bg-popover px-5 py-4 sm:px-6">
            {formActions}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <MobileBottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={formActions}
    >
      {formBody}
    </MobileBottomSheet>
  );
}
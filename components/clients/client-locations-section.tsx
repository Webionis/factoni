"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import {
  archiveClientLocationAction,
  createClientLocationAction,
  setDefaultClientLocationAction,
  updateClientLocationAction,
} from "@/lib/actions/client-locations";
import type { ClientLocationRow } from "@/lib/data/client-locations";
import { formatClientLocationAddress } from "@/lib/invoices/location-snapshot";
import type { ClientLocationFormValues } from "@/lib/validations/client-location";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { inputClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const emptyForm: ClientLocationFormValues = {
  label: "",
  address_line1: "",
  address_line2: "",
  postal_code: "",
  city: "",
  country: "France",
  notes: "",
};

function locationToForm(location: ClientLocationRow): ClientLocationFormValues {
  return {
    label: location.label,
    address_line1: location.address_line1 ?? "",
    address_line2: location.address_line2 ?? "",
    postal_code: location.postal_code ?? "",
    city: location.city ?? "",
    country: location.country ?? "France",
    notes: location.notes ?? "",
    is_default: location.is_default,
  };
}

interface ClientLocationsSectionProps {
  clientId: string;
  initialLocations: ClientLocationRow[];
}

export function ClientLocationsSection({
  clientId,
  initialLocations,
}: ClientLocationsSectionProps) {
  const router = useRouter();
  const [locations, setLocations] = useState(initialLocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ClientLocationFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowCreate(false);
    setError(null);
  }

  function startEdit(location: ClientLocationRow) {
    setEditingId(location.id);
    setShowCreate(false);
    setForm(locationToForm(location));
    setError(null);
  }

  function startCreate() {
    setShowCreate(true);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function updateField<K extends keyof ClientLocationFormValues>(
    key: K,
    value: ClientLocationFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = editingId
        ? await updateClientLocationAction(editingId, form)
        : await createClientLocationAction(clientId, form);

      if (result.error) {
        setError(result.error);
        return;
      }

      resetForm();
      router.refresh();
    });
  }

  function handleArchive(locationId: string) {
    if (!confirm("Archiver ce lieu d'intervention ?")) return;
    startTransition(async () => {
      const result = await archiveClientLocationAction(locationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLocations((current) => current.filter((location) => location.id !== locationId));
    });
  }

  function handleSetDefault(locationId: string) {
    startTransition(async () => {
      const result = await setDefaultClientLocationAction(locationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLocations((current) =>
        current.map((location) => ({
          ...location,
          is_default: location.id === locationId,
        })),
      );
    });
  }

  const showForm = showCreate || editingId;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4" aria-hidden />
          Adresses / lieux d&apos;intervention
        </CardTitle>
        {!showForm ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1"
            onClick={startCreate}
          >
            <Plus className="size-4" aria-hidden />
            Ajouter
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 pb-5 pt-0">
        {locations.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">
            Aucun lieu enregistré. Ajoutez les biens ou adresses d&apos;intervention
            de ce client.
          </p>
        ) : null}

        <ul className="space-y-3">
          {locations.map((location) => {
            const address = formatClientLocationAddress(location);
            return (
              <li
                key={location.id}
                className="rounded-lg border border-border/60 bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium break-words">{location.label}</p>
                      {location.is_default ? (
                        <Badge variant="secondary" className="text-xs">
                          Par défaut
                        </Badge>
                      ) : null}
                    </div>
                    {address ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {address}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Adresse non renseignée
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-full gap-1 sm:w-auto"
                    onClick={() => startEdit(location)}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Modifier
                  </Button>
                  {!location.is_default ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-full gap-1 sm:w-auto"
                      disabled={isPending}
                      onClick={() => handleSetDefault(location.id)}
                    >
                      <Star className="size-3.5" aria-hidden />
                      Définir par défaut
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-full gap-1 text-destructive hover:text-destructive sm:w-auto"
                    disabled={isPending}
                    onClick={() => handleArchive(location.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Archiver
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {showForm ? (
          <div className="space-y-4 rounded-lg border border-dashed border-border/70 bg-muted/15 p-4">
            <p className="text-sm font-medium">
              {editingId ? "Modifier le lieu" : "Nouveau lieu"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Libellé" htmlFor="location_label">
                <Input
                  id="location_label"
                  className={inputClassName}
                  value={form.label}
                  onChange={(e) => updateField("label", e.target.value)}
                  placeholder="Ex. Appartement Paris"
                />
              </FormField>
              <FormField label="Adresse" htmlFor="location_address">
                <Input
                  id="location_address"
                  className={inputClassName}
                  value={form.address_line1 ?? ""}
                  onChange={(e) => updateField("address_line1", e.target.value)}
                />
              </FormField>
              <FormField label="Complément" htmlFor="location_address2">
                <Input
                  id="location_address2"
                  className={inputClassName}
                  value={form.address_line2 ?? ""}
                  onChange={(e) => updateField("address_line2", e.target.value)}
                />
              </FormField>
              <FormField label="Code postal" htmlFor="location_postal">
                <Input
                  id="location_postal"
                  className={inputClassName}
                  value={form.postal_code ?? ""}
                  onChange={(e) => updateField("postal_code", e.target.value)}
                />
              </FormField>
              <FormField label="Ville" htmlFor="location_city">
                <Input
                  id="location_city"
                  className={inputClassName}
                  value={form.city ?? ""}
                  onChange={(e) => updateField("city", e.target.value)}
                />
              </FormField>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="sm"
                className={cn("h-10 w-full sm:w-auto")}
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-full sm:w-auto"
                onClick={resetForm}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

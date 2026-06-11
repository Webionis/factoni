"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import {
  createClientLocationAction,
} from "@/lib/actions/client-locations";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import { selectClassName, inputClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

type ClientLocationOption = {
  id: string;
  label: string;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  is_default: boolean;
};

function formatLocationOptionLabel(location: ClientLocationOption): string {
  const parts = [location.label];
  const cityLine = [location.postal_code, location.city].filter(Boolean).join(" ");
  if (location.address_line1) parts.push(location.address_line1);
  else if (cityLine) parts.push(cityLine);
  return parts.join(" — ");
}

interface InterventionLocationSelectProps {
  disabled?: boolean;
}

export function InterventionLocationSelect({
  disabled = false,
}: InterventionLocationSelectProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const clientId = useWatch({ control, name: "client_id" });
  const prevClientIdRef = useRef<string | null>(null);

  const [locations, setLocations] = useState<ClientLocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickLabel, setQuickLabel] = useState("");
  const [quickAddress, setQuickAddress] = useState("");
  const [quickPostalCode, setQuickPostalCode] = useState("");
  const [quickCity, setQuickCity] = useState("");
  const [quickError, setQuickError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!clientId) {
      setLocations([]);
      setValue("client_location_id", null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/clients/${clientId}/locations`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<{ locations: ClientLocationOption[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const nextLocations = data.locations ?? [];
        setLocations(nextLocations);

        const clientChanged = prevClientIdRef.current !== clientId;
        prevClientIdRef.current = clientId;

        if (!clientChanged) return;

        const defaultLocation = nextLocations.find((location) => location.is_default);
        setValue("client_location_id", defaultLocation?.id ?? null, {
          shouldValidate: true,
        });
      })
      .catch(() => {
        if (!cancelled) setLocations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, setValue]);

  function handleQuickAdd() {
    if (!clientId || !quickLabel.trim()) {
      setQuickError("Indiquez au minimum un libellé.");
      return;
    }

    setQuickError(null);
    startTransition(async () => {
      const result = await createClientLocationAction(clientId, {
        label: quickLabel.trim(),
        address_line1: quickAddress.trim() || undefined,
        postal_code: quickPostalCode.trim() || undefined,
        city: quickCity.trim() || undefined,
        country: "France",
      });

      if (result.error) {
        setQuickError(result.error);
        return;
      }

      const res = await fetch(`/api/clients/${clientId}/locations`);
      const data = (await res.json()) as { locations: ClientLocationOption[] };
      const nextLocations = data.locations ?? [];
      setLocations(nextLocations);

      if (result.location?.id) {
        setValue("client_location_id", result.location.id, { shouldValidate: true });
      }

      setShowQuickAdd(false);
      setQuickLabel("");
      setQuickAddress("");
      setQuickPostalCode("");
      setQuickCity("");
    });
  }

  return (
    <div className="space-y-3">
      <FormField
        label="Lieu d'intervention"
        htmlFor="client_location_id"
        error={errors.client_location_id?.message}
      >
        <select
          id="client_location_id"
          className={selectClassName}
          disabled={disabled || !clientId || loading}
          {...register("client_location_id")}
        >
          <option value="">Aucun lieu spécifique</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {formatLocationOptionLabel(location)}
              {location.is_default ? " (par défaut)" : ""}
            </option>
          ))}
          <option value="__add__" disabled>
            — Ajouter un lieu depuis la fiche client ou ci-dessous —
          </option>
        </select>
      </FormField>

      {clientId ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-full sm:w-auto"
            disabled={disabled || isPending}
            onClick={() => setShowQuickAdd((open) => !open)}
          >
            {showQuickAdd ? "Annuler" : "+ Ajouter un nouveau lieu"}
          </Button>
          {loading ? (
            <span className="text-xs text-muted-foreground">
              Chargement des lieux…
            </span>
          ) : null}
        </div>
      ) : null}

      {showQuickAdd && clientId ? (
        <div
          className={cn(
            "space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4",
          )}
        >
          <p className="text-sm font-medium">Nouveau lieu</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              className={inputClassName}
              placeholder="Libellé (ex. Appartement Paris)"
              value={quickLabel}
              onChange={(e) => setQuickLabel(e.target.value)}
            />
            <Input
              className={cn(inputClassName, "sm:col-span-2")}
              placeholder="Adresse"
              value={quickAddress}
              onChange={(e) => setQuickAddress(e.target.value)}
            />
            <Input
              className={inputClassName}
              placeholder="Code postal"
              value={quickPostalCode}
              onChange={(e) => setQuickPostalCode(e.target.value)}
            />
            <Input
              className={inputClassName}
              placeholder="Ville"
              value={quickCity}
              onChange={(e) => setQuickCity(e.target.value)}
            />
          </div>
          {quickError ? (
            <p className="text-sm text-destructive" role="alert">
              {quickError}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="h-10 w-full sm:w-auto"
            disabled={isPending}
            onClick={handleQuickAdd}
          >
            {isPending ? "Création…" : "Enregistrer le lieu"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

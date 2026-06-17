"use client";

import { Building2, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { CompanyLookupSuggestion } from "@/lib/entreprises/recherche-entreprises";
import { inputClassName } from "@/lib/constants/ui";
import type { CompanyFormValues } from "@/lib/validations/company";
import { cn } from "@/lib/utils";

interface CompanySearchComboboxProps {
  setValue: UseFormSetValue<CompanyFormValues>;
  onSelected?: () => void;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export function CompanySearchCombobox({
  setValue,
  onSelected,
}: CompanySearchComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyLookupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const search = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/entreprises/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = (await res.json()) as {
        results?: CompanyLookupSuggestion[];
        error?: string;
      };

      if (!res.ok) {
        setResults([]);
        setError(data.error ?? "Recherche impossible pour le moment.");
        return;
      }

      setResults(data.results ?? []);
      setActiveIndex(data.results?.length ? 0 : -1);
      if ((data.results ?? []).length === 0) {
        setError("Aucune entreprise trouvée. Vérifiez l'orthographe ou saisissez le SIREN.");
      }
    } catch {
      setResults([]);
      setError("Recherche impossible pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      void search(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query, open, search]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function applySuggestion(suggestion: CompanyLookupSuggestion) {
    setValue("trade_name", suggestion.trade_name, { shouldDirty: true, shouldValidate: true });
    setValue("legal_name", suggestion.legal_name, { shouldDirty: true, shouldValidate: true });
    setValue("address_line1", suggestion.address_line1, { shouldDirty: true, shouldValidate: true });
    setValue("address_line2", suggestion.address_line2, { shouldDirty: true });
    setValue("postal_code", suggestion.postal_code, { shouldDirty: true, shouldValidate: true });
    setValue("city", suggestion.city, { shouldDirty: true, shouldValidate: true });
    setValue("country", suggestion.country || "FR", { shouldDirty: true, shouldValidate: true });
    setValue("siren", suggestion.siren, { shouldDirty: true, shouldValidate: true });
    setValue("siret", suggestion.siret, { shouldDirty: true, shouldValidate: true });
    if (suggestion.vat_number) {
      setValue("vat_number", suggestion.vat_number, { shouldDirty: true, shouldValidate: true });
    }

    setQuery(suggestion.label);
    setOpen(false);
    setResults([]);
    setError(null);
    onSelected?.();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      applySuggestion(results[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && (loading || results.length > 0 || !!error);

  return (
    <div ref={rootRef} className="relative">
      <FormField
        label="Rechercher mon entreprise"
        htmlFor="company-search"
        hint="Nom, SIREN ou SIRET — registre officiel (API Entreprise / INSEE)"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="company-search"
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            placeholder="Ex. Dupont Plomberie, 123 456 789…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setError(null);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(inputClassName, "h-11 pl-10")}
          />
          {loading ? (
            <Loader2
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </div>
      </FormField>

      {showDropdown ? (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.1)]",
            "dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(15,23,42,0.98)]",
          )}
        >
          {loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Recherche en cours…
            </p>
          ) : null}

          {!loading && error ? (
            <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
              {error}
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-64 overflow-y-auto py-1"
            >
              {results.map((suggestion, index) => (
                <li key={suggestion.id} role="presentation">
                  <button
                    type="button"
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      index === activeIndex
                        ? "bg-[rgba(37,99,235,0.08)] dark:bg-[rgba(59,130,246,0.12)]"
                        : "hover:bg-[#f8fafc] dark:hover:bg-white/5",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <Building2
                      className="mt-0.5 size-4 shrink-0 text-[#2563eb] dark:text-[#93c5fd]"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                        {suggestion.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#64748b] dark:text-[#94a3b8]">
                        SIREN {suggestion.siren}
                        {suggestion.city ? ` · ${suggestion.postal_code} ${suggestion.city}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { ClientsTable } from "@/components/clients/clients-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  listFilterGroupClassName,
  mobileSearchInputClassName,
} from "@/lib/constants/mobile";
import { selectClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import type { ClientRow } from "@/lib/validations/client";

type TypeFilter = ClientRow["client_type"] | "all";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "company", label: "Professionnels" },
  { value: "individual", label: "Particuliers" },
];

function matchesQuery(client: ClientRow, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const haystack = [
    client.name,
    client.company_name,
    client.email,
    client.phone,
    client.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

interface ClientsListProps {
  clients: ClientRow[];
}

export function ClientsList({ clients }: ClientsListProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: clients.length };
    for (const client of clients) {
      counts[client.client_type] = (counts[client.client_type] ?? 0) + 1;
    }
    return counts;
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      if (typeFilter !== "all" && client.client_type !== typeFilter) {
        return false;
      }
      return matchesQuery(client, query);
    });
  }, [clients, query, typeFilter]);

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun client"
        description="Ajoutez votre premier client pour préparer vos factures en quelques secondes."
        actionLabel="Nouveau client"
        actionHref="/clients/new"
      />
    );
  }

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden overscroll-x-none touch-pan-y">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Nom, entreprise, email, téléphone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={mobileSearchInputClassName}
            aria-label="Rechercher un client"
          />
        </div>

        <div className={listFilterGroupClassName}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className={cn(selectClassName, "h-11 w-full min-w-[10rem] sm:w-auto")}
            aria-label="Filtrer par type de client"
          >
            {TYPE_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
                {typeCounts[value] !== undefined ? ` (${typeCounts[value]})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun résultat"
          description="Modifiez la recherche ou les filtres."
          className="py-10"
        />
      ) : (
        <ClientsTable clients={filtered} />
      )}
    </div>
  );
}

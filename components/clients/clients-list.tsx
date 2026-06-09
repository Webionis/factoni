"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { ClientCard } from "@/components/clients/client-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { ClientRow } from "@/lib/validations/client";

function matchesQuery(client: ClientRow, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const haystack = [
    client.name,
    client.company_name,
    client.email,
    client.phone,
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

  const filtered = useMemo(
    () => clients.filter((c) => matchesQuery(c, query)),
    [clients, query],
  );

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
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Nom, entreprise, email, téléphone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-9"
          aria-label="Rechercher un client"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun résultat"
          description="Modifiez votre recherche pour trouver un client."
          className="py-12"
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((client) => (
            <li key={client.id}>
              <ClientCard client={client} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {filtered.length} client{filtered.length > 1 ? "s" : ""}
        {query ? ` sur ${clients.length}` : ""}
      </p>
    </div>
  );
}

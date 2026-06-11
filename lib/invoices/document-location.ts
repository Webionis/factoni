import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getActiveClientLocationById,
} from "@/lib/data/client-locations";
import {
  buildClientLocationSnapshot,
} from "@/lib/invoices/location-snapshot";
import type { Database, Json } from "@/types/database";

export function normalizeClientLocationId(
  value: string | null | undefined,
): string | null {
  if (!value || !value.trim()) return null;
  return value.trim();
}

export async function assertClientLocationForDocument(
  supabase: SupabaseClient<Database>,
  userId: string,
  clientId: string,
  locationId: string | null | undefined,
): Promise<{ error?: string; locationId: string | null }> {
  const normalized = normalizeClientLocationId(locationId);
  if (!normalized) {
    return { locationId: null };
  }

  const location = await getActiveClientLocationById(
    supabase,
    normalized,
    userId,
  );
  if (!location || location.client_id !== clientId) {
    return {
      error: "Lieu d'intervention introuvable pour ce client.",
      locationId: null,
    };
  }

  return { locationId: normalized };
}

export async function buildValidationLocationFields(
  supabase: SupabaseClient<Database>,
  userId: string,
  clientId: string,
  locationId: string | null,
): Promise<{
  client_location_id: string | null;
  client_location_snapshot: Json | null;
}> {
  if (!locationId) {
    return { client_location_id: null, client_location_snapshot: null };
  }

  const location = await getActiveClientLocationById(
    supabase,
    locationId,
    userId,
  );
  if (!location || location.client_id !== clientId) {
    return { client_location_id: null, client_location_snapshot: null };
  }

  return {
    client_location_id: location.id,
    client_location_snapshot: buildClientLocationSnapshot(location),
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type ClientLocationRow =
  Database["public"]["Tables"]["client_locations"]["Row"];

const LOCATION_SELECT = `
  id,
  user_id,
  client_id,
  label,
  address_line1,
  address_line2,
  postal_code,
  city,
  country,
  notes,
  is_default,
  archived_at,
  created_at,
  updated_at
`;

export async function listActiveClientLocations(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<ClientLocationRow[]> {
  const { data, error } = await supabase
    .from("client_locations")
    .select(LOCATION_SELECT)
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("is_default", { ascending: false })
    .order("label", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function listClientLocationsForClientPage(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<ClientLocationRow[]> {
  const { data, error } = await supabase
    .from("client_locations")
    .select(LOCATION_SELECT)
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getClientLocationById(
  supabase: SupabaseClient<Database>,
  locationId: string,
  userId: string,
): Promise<ClientLocationRow | null> {
  const { data, error } = await supabase
    .from("client_locations")
    .select(LOCATION_SELECT)
    .eq("id", locationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getActiveClientLocationById(
  supabase: SupabaseClient<Database>,
  locationId: string,
  userId: string,
): Promise<ClientLocationRow | null> {
  const location = await getClientLocationById(supabase, locationId, userId);
  if (!location || location.archived_at) return null;
  return location;
}

export async function getDefaultClientLocation(
  supabase: SupabaseClient<Database>,
  clientId: string,
  userId: string,
): Promise<ClientLocationRow | null> {
  const { data, error } = await supabase
    .from("client_locations")
    .select(LOCATION_SELECT)
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .eq("is_default", true)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

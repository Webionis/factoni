import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type CatalogItemRow = Database["public"]["Tables"]["catalog_items"]["Row"];

const CATALOG_ITEM_SELECT = `
  id,
  user_id,
  label,
  unit_price_ht,
  vat_rate,
  item_nature,
  sort_order,
  archived_at,
  created_at,
  updated_at
`;

export async function listCatalogItemsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CatalogItemRow[]> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(CATALOG_ITEM_SELECT)
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getCatalogItemById(
  supabase: SupabaseClient<Database>,
  itemId: string,
  userId: string,
): Promise<CatalogItemRow | null> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(CATALOG_ITEM_SELECT)
    .eq("id", itemId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function countCatalogItemsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("catalog_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("archived_at", null);

  if (error) return 0;
  return count ?? 0;
}

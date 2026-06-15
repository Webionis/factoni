"use server";

import { revalidatePath } from "next/cache";

import {
  actionErrorFromSupabase,
  type ActionResult,
} from "@/lib/actions/errors";
import { requireAuthenticatedUser } from "@/lib/actions/utils";
import {
  getCatalogItemById,
  type CatalogItemRow,
} from "@/lib/data/catalog-items";
import { isDisbursementLine } from "@/lib/invoices/item-nature";
import { sanitizeText } from "@/lib/sanitize";
import {
  catalogItemFormSchema,
  type CatalogItemFormValues,
} from "@/lib/validations/catalog-item";

function revalidateCatalogPaths() {
  revalidatePath("/settings/catalog");
  revalidatePath("/invoices");
  revalidatePath("/quotes");
}

function resolveStoredVatRate(
  values: CatalogItemFormValues,
  vatRegime: "standard" | "franchise",
): number {
  if (vatRegime === "franchise" || isDisbursementLine(values.item_nature)) {
    return 0;
  }
  return values.vat_rate;
}

export async function createCatalogItemAction(
  rawValues: CatalogItemFormValues,
  vatRegime: "standard" | "franchise" = "standard",
): Promise<ActionResult & { item?: CatalogItemRow }> {
  const parsed = catalogItemFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      user_id: user.id,
      label: sanitizeText(parsed.data.label),
      unit_price_ht: parsed.data.unit_price_ht,
      vat_rate: resolveStoredVatRate(parsed.data, vatRegime),
      item_nature: parsed.data.item_nature,
    })
    .select(
      "id, user_id, label, unit_price_ht, vat_rate, item_nature, sort_order, archived_at, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return actionErrorFromSupabase(error, "Erreur lors de l'enregistrement");
  }

  revalidateCatalogPaths();
  return { success: true, item: data };
}

export async function updateCatalogItemAction(
  itemId: string,
  rawValues: CatalogItemFormValues,
  vatRegime: "standard" | "franchise" = "standard",
): Promise<ActionResult & { item?: CatalogItemRow }> {
  const parsed = catalogItemFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getCatalogItemById(supabase, itemId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Prestation introuvable." };
  }

  const { error } = await supabase
    .from("catalog_items")
    .update({
      label: sanitizeText(parsed.data.label),
      unit_price_ht: parsed.data.unit_price_ht,
      vat_rate: resolveStoredVatRate(parsed.data, vatRegime),
      item_nature: parsed.data.item_nature,
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la mise à jour");
  }

  const updated = await getCatalogItemById(supabase, itemId, user.id);
  if (!updated || updated.archived_at) {
    return { error: "Prestation introuvable après mise à jour." };
  }

  revalidateCatalogPaths();
  return { success: true, item: updated };
}

export async function archiveCatalogItemAction(
  itemId: string,
): Promise<ActionResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.error !== null) return { error: auth.error };
  const { supabase, user } = auth;

  const existing = await getCatalogItemById(supabase, itemId, user.id);
  if (!existing || existing.archived_at) {
    return { error: "Prestation introuvable." };
  }

  const { error } = await supabase
    .from("catalog_items")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    return actionErrorFromSupabase(error, "Erreur lors de la suppression");
  }

  revalidateCatalogPaths();
  return { success: true };
}

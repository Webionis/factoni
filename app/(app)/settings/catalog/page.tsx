import { redirect } from "next/navigation";

import { CatalogItemsSection } from "@/components/catalog/catalog-items-section";
import { listCatalogItemsForUser } from "@/lib/data/catalog-items";
import { getCompanyForUser } from "@/lib/auth/profile";
import { pageMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("catalog");

export default async function CatalogSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const company = await getCompanyForUser(supabase, user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const items = await listCatalogItemsForUser(supabase, user.id);

  return (
    <CatalogItemsSection
      initialItems={items}
      vatRegime={company.vat_regime}
      defaultVatRate={Number(company.default_vat_rate)}
    />
  );
}

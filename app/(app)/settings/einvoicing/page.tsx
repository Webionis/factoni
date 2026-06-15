import { redirect } from "next/navigation";

import { EinvoicingSettingsSection } from "@/components/einvoicing/einvoicing-settings-section";
import { PageHeader } from "@/components/layout/page-header";
import { getCompanyForUser } from "@/lib/auth/profile";
import { isPlatformEinvoicingActive } from "@/lib/e-invoicing/config";
import { assessCompanyEinvoicingReadiness } from "@/lib/e-invoicing/readiness";
import { pageMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("einvoicing");

export default async function EinvoicingSettingsPage() {
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

  const companyReport = assessCompanyEinvoicingReadiness(company);

  return (
    <div className="w-full space-y-8">
      <PageHeader
        title="Facturation électronique"
        description="Préparez la transmission de vos factures via une Plateforme Agréée (réforme 2026–2027)."
      />
      <EinvoicingSettingsSection
        companyReport={companyReport}
        platformPaEnabled={isPlatformEinvoicingActive()}
      />
    </div>
  );
}

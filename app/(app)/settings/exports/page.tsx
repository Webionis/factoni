import { redirect } from "next/navigation";

import { ExportsHub } from "@/components/exports/exports-hub";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/layout/page-header";
import { sectionSubheadingClassName, surfaceInfoBannerClassName } from "@/lib/constants/ui";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("exports");

export default async function ExportsSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full space-y-8 pb-4">
      <PageHeader
        title="Exports comptables"
        description="Centre d'export comptable — préparez, contrôlez et transmettez vos données à votre expert-comptable."
      />

      <section className={cn(surfaceInfoBannerClassName, "p-5 sm:p-6")}>
        <p className={cn("text-sm leading-relaxed", sectionSubheadingClassName)}>
          Exportez en CSV, Excel ou PDF. Séparateur point-virgule pour Excel FR,
          montants formatés, dates JJ/MM/AAAA, journal des ventes compatible
          logiciels comptables.
        </p>
      </section>

      <ExportsHub />
    </div>
  );
}

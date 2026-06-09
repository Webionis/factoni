import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/metadata";
import {
  CompanyForm,
  defaultCompanyFormValues,
} from "@/components/forms/company-form";
import { getCompanyForUser, getProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { companyRowToFormValues } from "@/lib/validations/company";

export const metadata = pageMetadata("onboarding");

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const company = await getCompanyForUser(supabase, user.id);
  const initialValues = company
    ? companyRowToFormValues(company)
    : { ...defaultCompanyFormValues, email: user.email ?? "" };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#2563eb]">Étape 1 sur 1</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">
          Votre entreprise
        </h1>
        <p className="mt-2 text-sm font-medium text-[#64748b]">
          Accès gratuit pendant la bêta.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-[#64748b]">
          Ces informations apparaîtront sur vos factures. Vous pourrez les
          modifier plus tard.
        </p>
      </div>
      <CompanyForm mode="onboarding" initialValues={initialValues} />
    </div>
  );
}

import { redirect } from "next/navigation";

import { PlanSummaryCard } from "@/components/billing/plan-summary-card";
import { pageMetadata } from "@/lib/metadata";
import { CompanyLogoUpload } from "@/components/company/company-logo-upload";
import { PageHeader } from "@/components/layout/page-header";
import { buildSubscriptionAccess } from "@/lib/billing/access";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import {
  CompanyForm,
  defaultCompanyFormValues,
} from "@/components/forms/company-form";
import { CompanyReminderSettings } from "@/components/settings/company-reminder-settings";
import { getCompanyLogoPreviewUrl } from "@/lib/actions/company-logo";
import { getCompanyForUser } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { companyRowToFormValues } from "@/lib/validations/company";

export const metadata = pageMetadata("company");

export default async function CompanySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [company, subscription] = await Promise.all([
    getCompanyForUser(supabase, user.id),
    getSubscriptionForUser(supabase, user.id),
  ]);
  const subscriptionAccess = buildSubscriptionAccess(subscription);
  const initialValues = company
    ? companyRowToFormValues(company)
    : { ...defaultCompanyFormValues, email: user.email ?? "" };

  const logoPreviewUrl = company?.logo_path
    ? await getCompanyLogoPreviewUrl()
    : null;

  return (
    <div className="w-full space-y-8">
      <PageHeader
        title="Mon entreprise"
        description="Informations affichées sur vos factures et documents PDF."
      />

      <PlanSummaryCard access={subscriptionAccess} />

      <CompanyLogoUpload
        initialPreviewUrl={logoPreviewUrl}
        hasCompany={!!company}
      />

      <CompanyForm mode="settings" initialValues={initialValues} />

      {company ? (
        <CompanyReminderSettings
          initialValues={{
            auto_reminders_enabled: company.auto_reminders_enabled,
            auto_reminder_day_3: company.auto_reminder_day_3,
            auto_reminder_day_7: company.auto_reminder_day_7,
            auto_reminder_day_14: company.auto_reminder_day_14,
            reminder_email_subject: company.reminder_email_subject ?? "",
            reminder_email_message: company.reminder_email_message ?? "",
          }}
        />
      ) : null}
    </div>
  );
}

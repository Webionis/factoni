import { redirect } from "next/navigation";

import { BillingHistoryCard } from "@/components/billing/billing-history-card";
import { pageMetadata } from "@/lib/metadata";
import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { PricingCard } from "@/components/billing/pricing-card";
import { PageHeader } from "@/components/layout/page-header";
import { buildSubscriptionAccess } from "@/lib/billing/access";
import { BILLING_PAGE_PLANS } from "@/lib/billing/plans";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { sectionHeadingClassName, sectionSubheadingClassName } from "@/lib/constants/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("billing");

export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscriptionForUser(supabase, user.id);
  const access = buildSubscriptionAccess(subscription);

  return (
    <div className="w-full space-y-10 pb-4">
      <PageHeader
        title="Abonnement & offres"
        description="Gérez votre offre actuelle et consultez les tarifs Starter et Pro."
      />

      <CurrentPlanCard access={access} className="relative" />

      <section aria-labelledby="future-plans-heading" className="space-y-5">
        <div>
          <h2 id="future-plans-heading" className={sectionHeadingClassName}>
            Nos offres
          </h2>
          <p className={sectionSubheadingClassName}>
            Starter 19 €/mois · Pro 39 €/mois — plan Pro offert aux membres
            fondateurs pendant l&apos;offre de lancement.
          </p>
        </div>

        <ul className="mx-auto grid w-full min-w-0 max-w-[52rem] gap-5 sm:gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
          {BILLING_PAGE_PLANS.map((plan) => (
            <li key={plan.id} className="min-h-0">
              <PricingCard {...plan} currentPlan={access.plan} />
            </li>
          ))}
        </ul>
      </section>

      <BillingHistoryCard />
    </div>
  );
}

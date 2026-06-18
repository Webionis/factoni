import { Suspense } from "react";
import { redirect } from "next/navigation";

import { BillingCheckoutNotice } from "@/components/billing/billing-checkout-notice";
import { BillingHistoryCard } from "@/components/billing/billing-history-card";
import { pageMetadata } from "@/lib/metadata";
import { CurrentPlanCard } from "@/components/billing/current-plan-card";
import { PricingCard } from "@/components/billing/pricing-card";
import { PageHeader } from "@/components/layout/page-header";
import { buildSubscriptionAccess } from "@/lib/billing/access";
import { BILLING_PAGE_PLANS } from "@/lib/billing/plans";
import { completeBillingCheckoutReturn } from "@/lib/billing/stripe/complete-checkout";
import { completeUpgradePaymentSession } from "@/lib/billing/stripe/apply-upgrade";
import { isBillingStripeConfigured } from "@/lib/billing/stripe/config";
import { fetchBillingHistory } from "@/lib/billing/stripe/billing-history";
import { refreshSubscriptionView } from "@/lib/billing/stripe/refresh-subscription";
import { getSubscriptionForUser } from "@/lib/data/subscriptions";
import { sectionHeadingClassName, sectionSubheadingClassName } from "@/lib/constants/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("billing");

interface BillingSettingsPageProps {
  searchParams: Promise<{
    checkout?: string;
    session_id?: string;
    portal?: string;
    upgrade?: string;
    downgrade?: string;
  }>;
}

export default async function BillingSettingsPage({
  searchParams,
}: BillingSettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const billingReady = isBillingStripeConfigured();
  const sessionId = params.session_id?.trim();

  if (params.upgrade === "success" && sessionId && billingReady) {
    try {
      await completeUpgradePaymentSession(sessionId, user.id);
      redirect("/settings/billing?checkout=success");
    } catch {
      redirect("/settings/billing?checkout=pending");
    }
  }

  if (sessionId && billingReady && user.email && params.upgrade !== "success") {
    const result = await completeBillingCheckoutReturn(
      user.id,
      user.email,
      sessionId,
    );
    redirect(
      result === "synced"
        ? "/settings/billing?checkout=success"
        : "/settings/billing?checkout=pending",
    );
  }

  let subscription = await getSubscriptionForUser(supabase, user.id);
  let cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false;
  let billingPeriodEnd = subscription?.current_period_end ?? null;

  if (billingReady && subscription?.stripe_subscription_id) {
    const refreshed = await refreshSubscriptionView(
      user.id,
      user.email ?? undefined,
      subscription,
      () => getSubscriptionForUser(supabase, user.id),
    );
    subscription = refreshed.subscription;
    if (refreshed.liveDisplay) {
      cancelAtPeriodEnd = refreshed.liveDisplay.cancelAtPeriodEnd;
      billingPeriodEnd = refreshed.liveDisplay.currentPeriodEnd;
    } else {
      cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? false;
      billingPeriodEnd = subscription?.current_period_end ?? null;
    }
  }

  const access = buildSubscriptionAccess(subscription);
  const billingHistory =
    billingReady && subscription?.stripe_customer_id
      ? await fetchBillingHistory(subscription.stripe_customer_id)
      : [];
  const noticeStatus =
    params.downgrade === "scheduled"
      ? "scheduled"
      : params.portal === "return"
        ? "portal"
        : params.checkout;

  return (
    <div className="w-full space-y-10 pb-4">
      <Suspense fallback={null}>
        <BillingCheckoutNotice status={noticeStatus} />
      </Suspense>

      <PageHeader
        title="Abonnement & offres"
        description={
          billingReady
            ? "Choisissez Starter ou Pro, ou gérez votre abonnement existant."
            : "Gérez votre offre actuelle et consultez les tarifs Starter et Pro."
        }
      />

      <CurrentPlanCard
        plan={access.plan}
        isActive={access.isActive}
        isBeta={access.isBeta}
        className="relative"
        billingPortalEnabled={billingReady}
        stripeCustomerId={subscription?.stripe_customer_id}
        currentPeriodEnd={billingPeriodEnd}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        pendingPlan={subscription?.pending_plan ?? null}
        pendingPlanEffectiveAt={subscription?.pending_plan_effective_at ?? null}
      />

      <section aria-labelledby="future-plans-heading" className="space-y-5">
        <div>
          <h2 id="future-plans-heading" className={sectionHeadingClassName}>
            Nos offres
          </h2>
          <p className={sectionSubheadingClassName}>
            {billingReady
              ? "Starter 19 €/mois · Pro 39 €/mois — paiement sécurisé par Stripe."
              : "Starter 19 €/mois · Pro 39 €/mois — abonnements bientôt activés."}
          </p>
        </div>

        <ul className="mx-auto grid w-full min-w-0 max-w-[52rem] gap-5 sm:gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
          {BILLING_PAGE_PLANS.map((plan) => {
            const isCurrentPlan = access.plan === plan.id;
            const isPendingTarget =
              subscription?.pending_plan === plan.id && !isCurrentPlan;
            const upgradeLabel =
              access.plan === "starter" && plan.id === "pro"
                ? "Passer à Pro"
                : access.plan === "pro" && plan.id === "starter"
                  ? "Passer à Starter"
                  : plan.ctaLabel;
            const actionLabel = isCurrentPlan
              ? "Votre offre actuelle"
              : isPendingTarget
                ? "Changement programmé"
                : upgradeLabel;

            return (
              <li key={plan.id} className="min-h-0">
                <PricingCard
                  {...plan}
                  ctaLabel={actionLabel}
                  currentPlan={access.plan}
                  checkoutEnabled={billingReady}
                  disabled={
                    !billingReady || isCurrentPlan || isPendingTarget
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>

      <BillingHistoryCard entries={billingHistory} />
    </div>
  );
}

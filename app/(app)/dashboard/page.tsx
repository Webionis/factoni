import { redirect } from "next/navigation";

import { ClientStatsCard } from "@/components/dashboard/client-stats-card";
import { pageMetadata } from "@/lib/metadata";
import { DashboardShortcuts } from "@/components/dashboard/dashboard-shortcuts";
import { DashboardQuoteStats } from "@/components/dashboard/dashboard-quote-stats";
import { DashboardStatGrid } from "@/components/dashboard/dashboard-stat-grid";
import { MonthEmptyBanner } from "@/components/dashboard/month-empty-banner";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { getCompanyForUser, isOnboardingCompleted } from "@/lib/auth/profile";
import { buildOnboardingSteps } from "@/lib/dashboard/onboarding-steps";
import { getDashboardData } from "@/lib/data/dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("dashboard");

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [data, company, onboardingDone] = await Promise.all([
    getDashboardData(supabase, user.id),
    getCompanyForUser(supabase, user.id),
    isOnboardingCompleted(supabase, user.id),
  ]);

  const onboardingSteps = buildOnboardingSteps({
    companyConfigured: onboardingDone && !!company?.trade_name?.trim(),
    clientCount: data.stats.clientCount,
    invoiceCount: data.stats.totalInvoices,
  });
  const dashboardTitle =
    company?.trade_name?.trim() ||
    user.email?.split("@")[0] ||
    "Mon entreprise";

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-w-0 space-y-12 pb-8">
      <div className="space-y-3">
        <DashboardHero title={dashboardTitle} />
        <p className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </p>
      </div>

      <OnboardingChecklist steps={onboardingSteps} />

      <DashboardStatGrid stats={data.stats} />

      <DashboardQuoteStats stats={data.quoteStats} />

      {!data.stats.hasRevenueThisMonth && data.stats.totalInvoices > 0 ? (
        <MonthEmptyBanner />
      ) : null}

      <ClientStatsCard clientCount={data.stats.clientCount} />

      <RevenueChart chart={data.revenueChart} />

      <DashboardShortcuts />

      <DashboardNotifications
        notifications={data.notifications}
        unreadCount={data.unreadNotificationCount}
        hasMoreActivities={data.hasMoreActivities}
      />

      <RecentInvoices invoices={data.recentInvoices} />
    </div>
  );
}

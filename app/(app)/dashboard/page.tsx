import { redirect } from "next/navigation";

import { ClientStatsCard } from "@/components/dashboard/client-stats-card";
import { DashboardActivityScroll } from "@/components/dashboard/dashboard-activity-scroll";
import { pageMetadata } from "@/lib/metadata";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardRevenueColumn } from "@/components/dashboard/dashboard-revenue-column";
import { DashboardShortcuts } from "@/components/dashboard/dashboard-shortcuts";
import { DashboardQuoteStats } from "@/components/dashboard/dashboard-quote-stats";
import { DashboardStatGrid } from "@/components/dashboard/dashboard-stat-grid";
import { MonthEmptyBanner } from "@/components/dashboard/month-empty-banner";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { getCompanyForUser, isOnboardingCompleted } from "@/lib/auth/profile";
import { buildHeroInsights, getGreetingName } from "@/lib/dashboard/hero-insights";
import { buildOnboardingSteps } from "@/lib/dashboard/onboarding-steps";
import { getDashboardData } from "@/lib/data/dashboard";
import {
  countScheduledJobsInRange,
  listUpcomingScheduledJobs,
} from "@/lib/data/scheduled-jobs";
import {
  endOfWeek,
  startOfWeek,
  toIsoDate,
} from "@/lib/dates/calendar-range";
import { createClient } from "@/lib/supabase/server";

export const metadata = pageMetadata("dashboard");

/** Cache navigation client — affichage instantané entre sections. */
export const unstable_dynamicStaleTime = 300;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const reference = new Date();
  const weekStart = toIsoDate(startOfWeek(reference, true));
  const weekEnd = toIsoDate(endOfWeek(reference, true));

  const [data, company, onboardingDone, upcomingJobs, jobsThisWeek] =
    await Promise.all([
      getDashboardData(supabase, user.id),
      getCompanyForUser(supabase, user.id),
      isOnboardingCompleted(supabase, user.id),
      listUpcomingScheduledJobs(supabase, user.id, toIsoDate(reference)),
      countScheduledJobsInRange(supabase, user.id, weekStart, weekEnd),
    ]);

  const onboardingSteps = buildOnboardingSteps({
    companyConfigured: onboardingDone && !!company?.trade_name?.trim(),
    clientCount: data.stats.clientCount,
    invoiceCount: data.stats.totalInvoices,
  });
  const companyName =
    company?.trade_name?.trim() ||
    user.email?.split("@")[0] ||
    "Mon entreprise";

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  })
    .format(reference)
    .replace(/^\w/, (c) => c.toUpperCase());

  const heroInsights = buildHeroInsights({
    stats: data.stats,
    revenueChart: data.revenueChart,
    notifications: data.notifications,
    reference,
    jobsThisWeek,
  });

  const showQuoteStats = data.quoteStats.totalQuotes > 0;

  return (
    <div className="min-w-0 space-y-6 md:space-y-8">
      <DashboardActivityScroll />

      {/* Mobile — court, actionnable */}
      <div className="flex flex-col gap-5 md:hidden">
        <DashboardHeader
          greetingName={getGreetingName({
            tradeName: company?.trade_name,
            email: user.email,
          })}
          companyName={companyName}
          monthLabel={monthLabel}
          insights={heroInsights}
          compact
        />

        <OnboardingChecklist steps={onboardingSteps} />

        <DashboardShortcuts compact />

        <DashboardStatGrid stats={data.stats} compact />

        {!data.stats.hasRevenueThisMonth && data.stats.totalInvoices > 0 ? (
          <MonthEmptyBanner />
        ) : null}

        <DashboardRevenueColumn chart={data.revenueChart} jobs={upcomingJobs} />

        <DashboardNotifications
          notifications={data.notifications}
          unreadCount={data.unreadNotificationCount}
          hasMoreActivities={data.hasMoreActivities}
        />

        <RecentInvoices invoices={data.recentInvoices} maxItems={4} />
      </div>

      {/* Desktop — vue complète */}
      <div className="hidden flex-col gap-8 md:flex">
        <DashboardHeader
          greetingName={getGreetingName({
            tradeName: company?.trade_name,
            email: user.email,
          })}
          companyName={companyName}
          monthLabel={monthLabel}
          insights={heroInsights}
        />

        <OnboardingChecklist steps={onboardingSteps} />

        <DashboardStatGrid stats={data.stats} />

        <DashboardShortcuts />

        {showQuoteStats ? (
          <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start">
            <DashboardQuoteStats stats={data.quoteStats} />
            <ClientStatsCard clientCount={data.stats.clientCount} />
          </div>
        ) : (
          <ClientStatsCard clientCount={data.stats.clientCount} />
        )}

        {!data.stats.hasRevenueThisMonth && data.stats.totalInvoices > 0 ? (
          <MonthEmptyBanner />
        ) : null}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:items-start">
          <DashboardRevenueColumn
            chart={data.revenueChart}
            jobs={upcomingJobs}
          />
          <DashboardNotifications
            notifications={data.notifications}
            unreadCount={data.unreadNotificationCount}
            hasMoreActivities={data.hasMoreActivities}
          />
        </div>

        <RecentInvoices invoices={data.recentInvoices} />
      </div>
    </div>
  );
}

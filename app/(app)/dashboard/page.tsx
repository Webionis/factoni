import { redirect } from "next/navigation";

import { ClientStatsCard } from "@/components/dashboard/client-stats-card";
import { pageMetadata } from "@/lib/metadata";
import { DashboardUpcomingJobs } from "@/components/dashboard/dashboard-upcoming-jobs";
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
import { buildHeroInsights, getGreetingName } from "@/lib/dashboard/hero-insights";
import { buildOnboardingSteps } from "@/lib/dashboard/onboarding-steps";
import { dashboardSectionStackClassName } from "@/lib/constants/dashboard-mobile";
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
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("dashboard");

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
  const dashboardTitle =
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

  return (
    <div className={cn("min-w-0 pb-8", dashboardSectionStackClassName)}>
      <DashboardHero
        title={dashboardTitle}
        greetingName={getGreetingName({
          tradeName: company?.trade_name,
          email: user.email,
        })}
        monthLabel={monthLabel}
        insights={heroInsights}
      />

      <OnboardingChecklist steps={onboardingSteps} />

      <DashboardStatGrid stats={data.stats} />

      <DashboardQuoteStats stats={data.quoteStats} />

      {!data.stats.hasRevenueThisMonth && data.stats.totalInvoices > 0 ? (
        <MonthEmptyBanner />
      ) : null}

      <ClientStatsCard clientCount={data.stats.clientCount} />

      <RevenueChart chart={data.revenueChart} />

      <DashboardShortcuts />

      <DashboardUpcomingJobs jobs={upcomingJobs} />

      <DashboardNotifications
        notifications={data.notifications}
        unreadCount={data.unreadNotificationCount}
        hasMoreActivities={data.hasMoreActivities}
      />

      <RecentInvoices invoices={data.recentInvoices} />
    </div>
  );
}

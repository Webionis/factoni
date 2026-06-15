import { DashboardUpcomingJobs } from "@/components/dashboard/dashboard-upcoming-jobs";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import type { RevenueChartPayload } from "@/lib/data/dashboard";
import type { ScheduledJobWithRelations } from "@/lib/data/scheduled-jobs";

interface DashboardRevenueColumnProps {
  chart: RevenueChartPayload;
  jobs: ScheduledJobWithRelations[];
}

/** Colonne gauche du dashboard : CA TTC puis rendez-vous, en deux cartes distinctes. */
export function DashboardRevenueColumn({
  chart,
  jobs,
}: DashboardRevenueColumnProps) {
  return (
    <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
      <RevenueChart chart={chart} />
      <DashboardUpcomingJobs jobs={jobs} compact />
    </div>
  );
}

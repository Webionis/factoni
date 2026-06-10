import { Skeleton } from "@/components/ui/skeleton";

import { dashboardSectionStackClassName } from "@/lib/constants/dashboard-mobile";
import { cn } from "@/lib/utils";

export default function DashboardLoading() {
  return (
    <div className={cn("min-w-0 w-full pb-8", dashboardSectionStackClassName)}>
      <div className="-mx-4 space-y-3 rounded-none bg-[#f0f5ff]/60 px-4 py-5 md:mx-0 md:bg-transparent md:p-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl md:h-32 md:rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-5 w-44" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.5rem] rounded-2xl md:h-[7.5rem]" />
        ))}
      </div>
    </div>
  );
}

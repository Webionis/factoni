import { Skeleton } from "@/components/ui/skeleton";
import { mobilePageStackClassName } from "@/lib/constants/mobile";
import { cn } from "@/lib/utils";

export default function DashboardLoading() {
  return (
    <div className={cn("min-w-0 w-full", mobilePageStackClassName)}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-28 w-full rounded-2xl" />

      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl md:h-28" />
          ))}
        </div>
      </div>

      <Skeleton className="h-36 w-full rounded-2xl" />

      <Skeleton className="h-52 w-full rounded-2xl" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  );
}

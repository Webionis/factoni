import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-w-0 w-full space-y-12 pb-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
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
          <Skeleton key={i} className="h-[7.5rem] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

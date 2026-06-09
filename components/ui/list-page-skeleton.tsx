import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListPageSkeletonProps {
  titleWidth?: string;
  showFilters?: boolean;
  itemCount?: number;
}

export function ListPageSkeleton({
  titleWidth = "w-36",
  showFilters = true,
  itemCount = 4,
}: ListPageSkeletonProps) {
  return (
    <div className="w-full space-y-6">
      <Skeleton className={cn("h-8", titleWidth)} />
      <Skeleton className="h-11 w-full rounded-xl" />
      {showFilters ? (
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, i) => (
          <Skeleton key={i} className="h-[7.5rem] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

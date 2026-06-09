import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/lib/site";

export default function ClientPortalLoading() {
  return (
    <div className="min-h-dvh bg-[#f8fafc] px-4 py-6 dark:bg-background sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        <header className="space-y-4 text-center">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto h-12 w-32 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto h-5 w-40" />
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
        </header>

        <div className="space-y-3 rounded-xl border bg-card p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-xs" />
          <Skeleton className="h-4 w-3/4 max-w-[200px]" />
        </div>

        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-md" />
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border bg-card p-5"
            >
              <div className="flex justify-between gap-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-7 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {siteConfig.name}
        </p>
      </div>
    </div>
  );
}

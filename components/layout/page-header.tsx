import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]/90 dark:text-[#60a5fa]/90">
          {siteConfig.name}
        </p>
        <h1 className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748b] dark:text-[#94a3b8] sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 sm:w-auto [&_a]:h-11 [&_a]:w-full [&_button]:h-11 [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

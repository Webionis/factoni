import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  premiumShadowClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(15,23,42,0.1)] bg-white px-6 py-16 text-center sm:py-20 dark:border-[rgba(148,163,184,0.16)] dark:bg-[rgba(30,41,59,0.45)]",
        premiumShadowClassName,
        className,
      )}
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-[rgba(37,99,235,0.08)] ring-1 ring-inset ring-[rgba(37,99,235,0.06)] dark:bg-[rgba(59,130,246,0.12)] dark:ring-[rgba(96,165,250,0.15)]">
        <Icon className="size-7 text-[#2563eb] dark:text-[#60a5fa]" strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={cn(
            buttonVariants(),
            transitionPremiumClassName,
            "mt-8 h-11 px-6",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

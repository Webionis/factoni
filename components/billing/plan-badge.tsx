import { PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { SubscriptionPlan } from "@/lib/billing/types";
import { betaBadgeClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const isBeta = plan === "beta";

  return (
    <span
      className={cn(
        isBeta
          ? betaBadgeClassName
          : "inline-flex items-center rounded-full border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(30,41,59,0.6)] dark:text-[#94a3b8]",
        className,
      )}
      title={
        isBeta
          ? "Accès complet gratuit pendant la bêta — aucune limite active."
          : undefined
      }
    >
      {PLAN_DISPLAY_NAMES[plan]}
    </span>
  );
}

import { LAUNCH_OFFER, PLAN_DISPLAY_NAMES } from "@/lib/billing/plans";
import type { SubscriptionPlan } from "@/lib/billing/types";
import { betaBadgeClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

const PAID_PLAN_BADGE_CLASS: Partial<Record<SubscriptionPlan, string>> = {
  starter:
    "border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.08)] text-[#1d4ed8] dark:border-[rgba(59,130,246,0.28)] dark:bg-[rgba(37,99,235,0.16)] dark:text-[#93c5fd]",
  pro: "border-[rgba(79,70,229,0.18)] bg-[rgba(79,70,229,0.08)] text-[#4338ca] dark:border-[rgba(129,140,248,0.28)] dark:bg-[rgba(79,70,229,0.16)] dark:text-[#c7d2fe]",
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const isBeta = plan === "beta";
  const paidPlanClass = PAID_PLAN_BADGE_CLASS[plan];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isBeta
          ? betaBadgeClassName
          : paidPlanClass ??
              "border-[rgba(15,23,42,0.08)] bg-[#f8fafc] text-[#64748b] dark:border-[rgba(148,163,184,0.14)] dark:bg-[rgba(30,41,59,0.6)] dark:text-[#94a3b8]",
        className,
      )}
      title={
        isBeta
          ? `${LAUNCH_OFFER.foundersPro} — ${LAUNCH_OFFER.earlyAccess.toLowerCase()}.`
          : undefined
      }
    >
      {PLAN_DISPLAY_NAMES[plan]}
    </span>
  );
}

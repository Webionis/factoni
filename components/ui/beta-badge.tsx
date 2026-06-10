import { LAUNCH_OFFER } from "@/lib/billing/plans";
import { betaBadgeClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  className?: string;
  /** Attribut title natif (accessibilité simple, sans lib tooltip). */
  showHint?: boolean;
}

export function BetaBadge({ className, showHint = true }: BetaBadgeProps) {
  return (
    <span
      className={cn(betaBadgeClassName, className)}
      title={showHint ? LAUNCH_OFFER.signupHint : undefined}
    >
      {LAUNCH_OFFER.earlyAccess}
    </span>
  );
}

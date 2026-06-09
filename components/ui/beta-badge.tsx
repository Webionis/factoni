import { betaBadgeClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const BETA_TOOLTIP =
  "Vous utilisez actuellement la version bêta gratuite.";

interface BetaBadgeProps {
  className?: string;
  /** Attribut title natif (accessibilité simple, sans lib tooltip). */
  showHint?: boolean;
}

export function BetaBadge({ className, showHint = true }: BetaBadgeProps) {
  return (
    <span
      className={cn(betaBadgeClassName, className)}
      title={showHint ? BETA_TOOLTIP : undefined}
    >
      Bêta
    </span>
  );
}

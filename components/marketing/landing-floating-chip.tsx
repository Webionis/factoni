import { landingChipAccentClassName } from "@/lib/constants/marketing-landing";
import { transitionPremiumClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface LandingFloatingChipProps {
  children: React.ReactNode;
  className?: string;
}

export function LandingFloatingChip({
  children,
  className,
}: LandingFloatingChipProps) {
  return (
    <div
      className={cn(
        landingChipAccentClassName,
        "rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/98 py-2.5 pr-3 backdrop-blur-[4px]",
        transitionPremiumClassName,
        "hover:border-[rgba(37,99,235,0.2)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08),0_24px_48px_rgba(37,99,235,0.09)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

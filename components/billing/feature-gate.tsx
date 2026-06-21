"use client";

import { useHasFeature } from "@/components/billing/subscription-provider";
import { UpgradePlanPrompt } from "@/components/billing/upgrade-plan-prompt";
import type { FeatureKey } from "@/lib/billing/types";

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  compact = false,
  className,
}: FeatureGateProps) {
  const hasAccess = useHasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePlanPrompt
      feature={feature}
      compact={compact}
      className={className}
    />
  );
}

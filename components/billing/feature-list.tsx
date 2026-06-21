import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeatureListProps {
  features: readonly string[];
  className?: string;
}

export function FeatureList({ features, className }: FeatureListProps) {
  return (
    <ul className={cn("space-y-2.5", className)} aria-label="Fonctionnalités incluses">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-[14px] text-[#334155]">
          <Check
            className="mt-0.5 size-4 shrink-0 text-[#2563eb]"
            strokeWidth={2.5}
            aria-hidden
          />
          {feature}
        </li>
      ))}
    </ul>
  );
}

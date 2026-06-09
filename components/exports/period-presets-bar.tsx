"use client";

import { PERIOD_PRESETS } from "@/lib/exports/period-presets";
import type { PeriodPresetId } from "@/lib/exports/types";
import {
  filterPillActiveClassName,
  filterPillClassName,
  filterPillInactiveClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface PeriodPresetsBarProps {
  activePreset: PeriodPresetId | null;
  onSelect: (presetId: PeriodPresetId) => void;
  className?: string;
}

export function PeriodPresetsBar({
  activePreset,
  onSelect,
  className,
}: PeriodPresetsBarProps) {
  return (
    <div className={cn("-mx-1 min-w-0 overflow-x-auto px-1 pb-0.5", className)}>
      <div className="flex w-max max-w-full flex-nowrap gap-2 sm:w-auto sm:flex-wrap">
        {PERIOD_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className={cn(
              filterPillClassName,
              "shrink-0 text-xs",
              activePreset === preset.id
                ? filterPillActiveClassName
                : filterPillInactiveClassName,
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

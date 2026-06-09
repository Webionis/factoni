"use client";

import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/lib/exports/types";
import {
  filterPillActiveClassName,
  filterPillClassName,
  filterPillInactiveClassName,
} from "@/lib/constants/ui";

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
  { value: "pdf", label: "PDF" },
];

interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
  allowed?: ExportFormat[];
  className?: string;
}

export function FormatSelector({
  value,
  onChange,
  allowed = ["csv", "xlsx", "pdf"],
  className,
}: FormatSelectorProps) {
  const options = FORMATS.filter((f) => allowed.includes(f.value));

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label="Format d'export">
      {options.map((format) => (
        <button
          key={format.value}
          type="button"
          onClick={() => onChange(format.value)}
          className={cn(
            filterPillClassName,
            value === format.value
              ? filterPillActiveClassName
              : filterPillInactiveClassName,
          )}
        >
          {format.label}
        </button>
      ))}
    </div>
  );
}

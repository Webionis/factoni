import Link from "next/link";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import type { EinvoicingReadinessItem } from "@/lib/e-invoicing/types";
import { cn } from "@/lib/utils";

interface EinvoicingReadinessListProps {
  items: EinvoicingReadinessItem[];
  className?: string;
}

function iconForLevel(level: EinvoicingReadinessItem["level"]) {
  switch (level) {
    case "ok":
      return CheckCircle2;
    case "warning":
      return AlertCircle;
    default:
      return AlertCircle;
  }
}

function toneForLevel(level: EinvoicingReadinessItem["level"]) {
  switch (level) {
    case "ok":
      return "text-emerald-600 dark:text-emerald-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-destructive";
  }
}

export function EinvoicingReadinessList({
  items,
  className,
}: EinvoicingReadinessListProps) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((entry) => {
        const Icon = iconForLevel(entry.level);
        const content = (
          <span className="flex items-start gap-2.5 text-sm">
            <Icon
              className={cn("mt-0.5 size-4 shrink-0", toneForLevel(entry.level))}
              aria-hidden
            />
            <span>{entry.message}</span>
          </span>
        );

        return (
          <li key={entry.id}>
            {entry.href ? (
              <Link
                href={entry.href}
                className="block rounded-lg px-1 py-0.5 transition-colors hover:bg-muted/60"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface EinvoicingTimelineProps {
  className?: string;
}

export function EinvoicingTimeline({ className }: EinvoicingTimelineProps) {
  const milestones = [
    {
      date: "1er septembre 2026",
      label: "Réception obligatoire pour toutes les entreprises assujetties à la TVA.",
    },
    {
      date: "1er septembre 2027",
      label:
        "Émission obligatoire pour les PME, TPE et micro-entreprises via une Plateforme Agréée.",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {milestones.map((milestone) => (
        <div
          key={milestone.date}
          className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium">{milestone.date}</p>
            <p className="text-sm text-muted-foreground">{milestone.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

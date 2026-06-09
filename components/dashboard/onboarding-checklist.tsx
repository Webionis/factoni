"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import type { OnboardingStep } from "@/lib/dashboard/onboarding-steps";
import {
  surfaceCardClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
}

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const doneCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (doneCount / totalSteps) * 100 : 0;
  const shouldShowSetupBanner = doneCount < totalSteps;

  if (!shouldShowSetupBanner) {
    return null;
  }

  return (
    <section
      className={cn(surfaceCardClassName, "p-5 sm:p-6")}
      aria-labelledby="onboarding-checklist-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id="onboarding-checklist-heading"
            className="text-sm font-semibold tracking-tight text-[#0f172a] dark:text-[#f8fafc]"
          >
            Premiers pas
          </h2>
          <p className="mt-1 text-xs text-[#64748b] dark:text-[#94a3b8]">
            {doneCount} sur {steps.length} terminés — accès gratuit pendant la
            bêta
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#2563eb] dark:text-[#93c5fd]">
          {Math.round(progress)}%
        </span>
      </div>

      <div
        className="mt-4 h-1 overflow-hidden rounded-full bg-[#f1f5f9] dark:bg-[rgba(148,163,184,0.12)]"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label="Progression de la configuration"
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-[#3478ff] to-[#2563eb]",
            transitionPremiumClassName,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 space-y-0.5">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                transitionPremiumClassName,
                step.done
                  ? "text-[#64748b] dark:text-[#94a3b8]"
                  : "text-[#0f172a] hover:bg-[#f8fafc] dark:text-[#f8fafc] dark:hover:bg-white/[0.06]",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  transitionPremiumClassName,
                  step.done
                    ? "border-[rgba(22,163,74,0.25)] bg-[#f0fdf4] text-[#16a34a] shadow-[0_0_0_1px_rgba(22,163,74,0.08)] dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-400"
                    : "border-[rgba(15,23,42,0.12)] bg-white dark:border-[rgba(148,163,184,0.2)] dark:bg-[rgba(30,41,59,0.6)]",
                )}
                aria-hidden
              >
                {step.done ? (
                  <Check className="size-3 motion-safe:animate-[ff-fade-in-up_0.3s_ease-out_both]" strokeWidth={2.5} />
                ) : null}
              </span>
              <span
                className={cn(
                  "text-sm",
                  step.done && "line-through decoration-[#94a3b8]/50",
                )}
              >
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

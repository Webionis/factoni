import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  UserPlus,
} from "lucide-react";

import { agendaCopy } from "@/lib/agenda/copy";
import {
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardClassName,
  transitionPremiumClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  {
    href: "/agenda?create=1",
    label: agendaCopy.plan,
    description: "Agenda",
    icon: CalendarDays,
    iconClassName:
      "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    primary: false,
  },
  {
    href: "/quotes/new",
    label: "Nouveau devis",
    description: "Créer un DV",
    icon: ClipboardList,
    iconClassName:
      "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    primary: false,
  },
  {
    href: "/invoices/new",
    label: "Nouvelle facture",
    description: "Facturer un client",
    icon: FileText,
    iconClassName:
      "bg-[rgba(37,99,235,0.12)] text-[#2563eb] dark:bg-blue-500/20 dark:text-[#93c5fd]",
    primary: true,
  },
  {
    href: "/clients/new",
    label: "Nouveau client",
    description: "Ajouter un contact",
    icon: UserPlus,
    iconClassName:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    primary: false,
  },
] as const;

export function DashboardShortcuts() {
  return (
    <section className="min-w-0 space-y-3" aria-labelledby="dashboard-shortcuts-heading">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="dashboard-shortcuts-heading" className={sectionHeadingClassName}>
            Actions rapides
          </h2>
          <p className={cn("mt-0.5", sectionSubheadingClassName)}>
            Les tâches les plus courantes, en un clic.
          </p>
        </div>
      </div>

      <div className={cn(surfaceCardClassName, "p-3 sm:p-4")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {SHORTCUTS.map(
            ({ href, label, description, icon: Icon, iconClassName, primary }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex min-h-[5.25rem] flex-col justify-between rounded-xl border p-3.5 sm:min-h-[6rem] sm:p-4",
                  transitionPremiumClassName,
                  primary
                    ? "border-[rgba(37,99,235,0.16)] bg-[rgba(37,99,235,0.05)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] hover:border-[rgba(37,99,235,0.28)] hover:bg-[rgba(37,99,235,0.08)] dark:border-[rgba(96,165,250,0.22)] dark:bg-[rgba(59,130,246,0.1)] dark:hover:bg-[rgba(59,130,246,0.14)]"
                    : "border-[rgba(15,23,42,0.06)] bg-[#fafbfc]/80 hover:border-[rgba(37,99,235,0.12)] hover:bg-white dark:border-[rgba(148,163,184,0.1)] dark:bg-[rgba(15,23,42,0.35)] dark:hover:border-[rgba(96,165,250,0.18)] dark:hover:bg-[rgba(30,41,59,0.55)]",
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06] sm:size-10 sm:rounded-xl",
                      iconClassName,
                    )}
                  >
                    <Icon className="size-[1.125rem] sm:size-5" strokeWidth={2} aria-hidden />
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-[#cbd5e1] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[#2563eb] group-hover:opacity-100 dark:text-[#475569] dark:group-hover:text-[#93c5fd]"
                    aria-hidden
                  />
                </div>
                <div className="mt-3 min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-semibold leading-snug tracking-tight sm:text-sm",
                      primary
                        ? "text-[#1d4ed8] dark:text-[#93c5fd]"
                        : "text-[#0f172a] dark:text-[#f8fafc]",
                    )}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#94a3b8] dark:text-[#64748b]">
                    {description}
                  </p>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

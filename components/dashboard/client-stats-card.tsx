import Link from "next/link";
import { ArrowRight, UserPlus, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  sectionHeadingClassName,
  sectionSubheadingClassName,
  surfaceCardClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ClientStatsCardProps {
  clientCount: number;
}

export function ClientStatsCard({ clientCount }: ClientStatsCardProps) {
  return (
    <section className="min-w-0 space-y-4" aria-labelledby="dashboard-clients-heading">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="dashboard-clients-heading" className={sectionHeadingClassName}>
            Clients
          </h2>
          <p className={cn("mt-0.5", sectionSubheadingClassName)}>
            Votre carnet de clients pour facturer plus vite.
          </p>
        </div>
        <Link
          href="/clients"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-10 shrink-0 gap-1 px-2",
          )}
        >
          Tout voir
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div
        className={cn(
          surfaceCardClassName,
          "flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] text-[#2563eb] ring-1 ring-inset ring-[#2563eb]/10 dark:bg-blue-500/15 dark:text-[#60a5fa]">
            <Users className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b] dark:text-[#94a3b8]">
              Clients enregistrés
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              {clientCount}
            </p>
          </div>
        </div>
        <Link
          href="/clients/new"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-1.5")}
        >
          <UserPlus className="size-4" aria-hidden />
          Nouveau client
        </Link>
      </div>
    </section>
  );
}

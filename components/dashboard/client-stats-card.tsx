import Link from "next/link";
import { Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { surfaceCardStatClassName } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface ClientStatsCardProps {
  clientCount: number;
}

export function ClientStatsCard({ clientCount }: ClientStatsCardProps) {
  return (
    <div
      className={cn(
        surfaceCardStatClassName,
        "flex min-w-0 items-center justify-between gap-4 p-5 sm:p-6",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
          <Users className="size-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Clients</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {clientCount}
          </p>
        </div>
      </div>
      <Link
        href="/clients/new"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10")}
      >
        Ajouter
      </Link>
    </div>
  );
}

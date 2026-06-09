import Link from "next/link";
import { ClipboardList, FileText, UserPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardShortcuts() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link
        href="/quotes/new"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-full justify-center gap-2 text-base",
        )}
      >
        <ClipboardList className="size-5" aria-hidden />
        Nouveau devis
      </Link>
      <Link
        href="/invoices/new"
        className={cn(
          buttonVariants(),
          "h-12 w-full justify-center gap-2 text-base",
        )}
      >
        <FileText className="size-5" aria-hidden />
        Nouvelle facture
      </Link>
      <Link
        href="/clients/new"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-full justify-center gap-2 text-base",
        )}
      >
        <UserPlus className="size-5" aria-hidden />
        Nouveau client
      </Link>
    </div>
  );
}

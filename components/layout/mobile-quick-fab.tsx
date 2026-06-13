"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAB_ROUTES = ["/dashboard", "/quotes", "/invoices", "/agenda"];

export function MobileQuickFab() {
  const pathname = usePathname();
  const show = FAB_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  if (
    !show ||
    pathname === "/invoices/new" ||
    pathname === "/quotes/new"
  ) {
    return null;
  }

  const onQuotes = pathname.startsWith("/quotes");
  const onAgenda = pathname.startsWith("/agenda");
  const href = onAgenda
    ? "/agenda?create=1"
    : onQuotes
      ? "/quotes/new"
      : "/invoices/new";
  const label = onAgenda
    ? "Planifier un chantier"
    : onQuotes
      ? "Nouveau devis"
      : "Nouvelle facture";

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants(),
        "fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 flex size-14 touch-manipulation items-center justify-center rounded-2xl shadow-lg shadow-primary/35 transition-transform duration-150 active:scale-95 md:hidden",
      )}
      aria-label={label}
    >
      <Plus className="size-6" aria-hidden />
    </Link>
  );
}
